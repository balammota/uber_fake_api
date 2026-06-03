"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase";
import { latestEventsByDriver, latestScoresByDriver } from "@/lib/telematics-utils";
import { STATESAFE_PARTNER_ID } from "@/lib/statesafe-constants";
import { computePortfolioStats } from "@/lib/statesafe-utils";

export function useStateSafeData(enabled = true) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [allDrivers, setAllDrivers] = useState([]);
  const [scores, setScores] = useState([]);
  const [events, setEvents] = useState([]);
  const [partner, setPartner] = useState(null);
  const [webhooks, setWebhooks] = useState([]);
  const [logs, setLogs] = useState([]);

  const loadData = useCallback(async (options = {}) => {
    const isRefresh = options.refresh === true;
    if (!enabled) return;
    if (isRefresh) setRefreshing(true);
    else {
      setLoading(true);
      setError(null);
    }
    try {
      const supabase = createSupabaseBrowser();
      const [dRes, sRes, eRes, pRes, wRes, lRes] = await Promise.all([
        supabase.from("telematics_drivers").select("*").order("driver_id"),
        supabase.from("telematics_scores").select("*").order("recorded_at", { ascending: false }),
        supabase.from("telematics_events").select("*").order("recorded_at", { ascending: false }),
        supabase
          .from("telematics_partners")
          .select("*")
          .eq("partner_id", STATESAFE_PARTNER_ID)
          .maybeSingle(),
        supabase
          .from("telematics_webhooks")
          .select("*")
          .eq("partner_id", STATESAFE_PARTNER_ID)
          .order("created_at", { ascending: false })
          .limit(20),
        supabase
          .from("telematics_logs")
          .select("*")
          .eq("partner_id", STATESAFE_PARTNER_ID)
          .order("created_at", { ascending: false })
          .limit(20),
      ]);

      if (dRes.error) throw dRes.error;
      if (sRes.error) throw sRes.error;
      if (eRes.error) throw eRes.error;
      if (pRes.error) throw pRes.error;
      if (wRes.error) throw wRes.error;
      if (lRes.error) throw lRes.error;

      const all = dRes.data || [];
      setAllDrivers(all);
      setDrivers(all.filter((d) => d.consent_status === "active"));
      setScores(sRes.data || []);
      setEvents(eRes.data || []);
      setPartner(pRes.data);
      setWebhooks(wRes.data || []);
      setLogs(lRes.data || []);
    } catch (err) {
      setError(err?.message || "Failed to load portal data");
    } finally {
      if (isRefresh) setRefreshing(false);
      else setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const scoreMap = useMemo(() => latestScoresByDriver(scores), [scores]);
  const eventMap = useMemo(() => latestEventsByDriver(events), [events]);
  const stats = useMemo(() => computePortfolioStats(drivers, scoreMap), [drivers, scoreMap]);

  return {
    loading,
    refreshing,
    error,
    drivers,
    allDrivers,
    scores,
    events,
    partner,
    webhooks,
    logs,
    scoreMap,
    eventMap,
    stats,
    reload: () => loadData({ refresh: true }),
  };
}

export async function logApiCall(supabase, { driver_id, endpoint, status_code, response_time_ms }) {
  await supabase.from("telematics_logs").insert({
    partner_id: STATESAFE_PARTNER_ID,
    driver_id: driver_id || null,
    endpoint,
    method: "GET",
    status_code,
    response_time_ms,
    timestamp_ms: Date.now(),
  });

  const { data: partner } = await supabase
    .from("telematics_partners")
    .select("api_calls_total, api_calls_today")
    .eq("partner_id", STATESAFE_PARTNER_ID)
    .single();

  if (partner) {
    await supabase
      .from("telematics_partners")
      .update({
        api_calls_total: (partner.api_calls_total || 0) + 1,
        api_calls_today: (partner.api_calls_today || 0) + 1,
      })
      .eq("partner_id", STATESAFE_PARTNER_ID);
  }
}
