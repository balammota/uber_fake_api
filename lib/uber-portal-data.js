"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase";
import { latestScoresByDriver } from "@/lib/telematics-utils";
import {
  avgLatency,
  generateAlerts,
  globalErrorRate,
  isApiDegraded,
} from "@/lib/uber-portal-utils";

export function useUberPortalData(enabled = true, acknowledgedAlerts = new Set()) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [partners, setPartners] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [scores, setScores] = useState([]);
  const [logs, setLogs] = useState([]);
  const [webhooks, setWebhooks] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadData = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const supabase = createSupabaseBrowser();
      const [pRes, dRes, sRes, lRes, wRes] = await Promise.all([
        supabase.from("telematics_partners").select("*").order("partner_name"),
        supabase.from("telematics_drivers").select("*").order("driver_id"),
        supabase.from("telematics_scores").select("*").order("recorded_at", { ascending: false }),
        supabase
          .from("telematics_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(500),
        supabase
          .from("telematics_webhooks")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50),
      ]);

      if (pRes.error) throw pRes.error;
      if (dRes.error) throw dRes.error;
      if (sRes.error) throw sRes.error;
      if (lRes.error) throw lRes.error;
      if (wRes.error) throw wRes.error;

      setPartners(pRes.data || []);
      setDrivers(dRes.data || []);
      setScores(sRes.data || []);
      setLogs(lRes.data || []);
      setWebhooks(wRes.data || []);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err?.message || "Failed to load portal data");
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const scoreMap = useMemo(() => latestScoresByDriver(scores), [scores]);
  const activeDrivers = useMemo(
    () => drivers.filter((d) => d.consent_status === "active"),
    [drivers]
  );
  const activePartners = useMemo(
    () => partners.filter((p) => p.status === "active"),
    [partners]
  );

  const alerts = useMemo(
    () => generateAlerts({ partners, logs, webhooks, acknowledged: acknowledgedAlerts }),
    [partners, logs, webhooks, acknowledgedAlerts]
  );

  const systemMetrics = useMemo(
    () => ({
      degraded: isApiDegraded(logs),
      errorRate: globalErrorRate(logs, 24),
      latency: avgLatency(logs.slice(0, 100)) || 142,
    }),
    [logs]
  );

  return {
    loading,
    error,
    partners,
    drivers,
    scores,
    logs,
    webhooks,
    scoreMap,
    activeDrivers,
    activePartners,
    alerts,
    systemMetrics,
    lastUpdated,
    reload: loadData,
    setPartners,
  };
}
