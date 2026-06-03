"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import TelematicsNav from "@/components/TelematicsNav";
import { createSupabaseBrowser } from "@/lib/supabase";
import {
  PROGRESSIVE_PARTNER_ID,
  discountFromScore,
  formatTime,
  formatUsd,
  gradeBadgeClass,
  latestEventsByDriver,
  latestScoresByDriver,
  recommendationFromScore,
  scoreDistribution,
} from "@/lib/telematics-utils";
import {
  Badge,
  ErrorState,
  LoadingState,
  PrimaryButton,
  TelematicsCard,
  TelematicsStatCard,
  TelematicsTable,
  Toast,
} from "@/app/components/telematics-ui";

export default function InsurerTelematicsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [scores, setScores] = useState([]);
  const [events, setEvents] = useState([]);
  const [partner, setPartner] = useState(null);
  const [webhooks, setWebhooks] = useState([]);
  const [driverId, setDriverId] = useState("");
  const [querying, setQuerying] = useState(false);
  const [queryResult, setQueryResult] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [toast, setToast] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createSupabaseBrowser();
      const [dRes, sRes, eRes, pRes, wRes] = await Promise.all([
        supabase.from("telematics_drivers").select("*").eq("consent_status", "active"),
        supabase.from("telematics_scores").select("*").order("recorded_at", { ascending: false }),
        supabase.from("telematics_events").select("*").order("recorded_at", { ascending: false }),
        supabase
          .from("telematics_partners")
          .select("*")
          .eq("partner_id", PROGRESSIVE_PARTNER_ID)
          .maybeSingle(),
        supabase
          .from("telematics_webhooks")
          .select("*")
          .eq("partner_id", PROGRESSIVE_PARTNER_ID)
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      if (dRes.error) throw dRes.error;
      if (sRes.error) throw sRes.error;
      if (eRes.error) throw eRes.error;
      if (pRes.error) throw pRes.error;
      if (wRes.error) throw wRes.error;

      setDrivers(dRes.data || []);
      setScores(sRes.data || []);
      setEvents(eRes.data || []);
      setPartner(pRes.data);
      setWebhooks(wRes.data || []);
    } catch (err) {
      setError(err?.message || "Failed to load insurer dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const scoreMap = useMemo(() => latestScoresByDriver(scores), [scores]);
  const eventMap = useMemo(() => latestEventsByDriver(events), [events]);

  const activeScores = useMemo(
    () => drivers.map((d) => scoreMap.get(d.driver_id)?.score).filter((s) => typeof s === "number"),
    [drivers, scoreMap]
  );

  const avgScore = useMemo(() => {
    if (!activeScores.length) return 0;
    return Math.round(activeScores.reduce((a, b) => a + b, 0) / activeScores.length);
  }, [activeScores]);

  const premiumSavings = formatUsd(Math.max(0, (avgScore - 50) * 120));

  const buckets = useMemo(() => scoreDistribution(activeScores), [activeScores]);
  const maxBucket = Math.max(1, ...buckets.map((b) => b.count));

  const portfolioRows = useMemo(
    () =>
      drivers.map((d) => {
        const sc = scoreMap.get(d.driver_id);
        const ev = eventMap.get(d.driver_id);
        const score = sc?.score ?? 0;
        const disc = discountFromScore(score);
        return {
          key: d.driver_id,
          cells: [
            <span key="n">
              <span className="block font-medium text-white">{d.driver_name}</span>
              <span className="text-xs text-zinc-500">{d.driver_id}</span>
            </span>,
            d.city,
            score,
            sc?.grade ? (
              <Badge key="g" className={gradeBadgeClass(sc.grade)}>
                {sc.grade}
              </Badge>
            ) : (
              "—"
            ),
            ev?.harsh_braking ?? "—",
            ev?.speeding ?? "—",
            ev?.phone_usage ?? "—",
            <span key="d" className={disc.className}>
              {disc.label}
            </span>,
          ],
        };
      }),
    [drivers, scoreMap, eventMap]
  );

  async function handleQuery() {
    if (!driverId.trim()) return;
    setQuerying(true);
    setQueryResult(null);
    try {
      const res = await fetch("/api/telematics/query-driver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driver_id: driverId.trim() }),
      });
      const body = await res.json();
      setQueryResult({ status: res.status, ...body });
      await loadData();
    } catch (err) {
      setQueryResult({ status: 500, message: err?.message || "Request failed" });
    } finally {
      setQuerying(false);
    }
  }

  async function handleSimulate() {
    setSimulating(true);
    try {
      const res = await fetch("/api/telematics/simulate-calls", { method: "POST" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Simulation failed");
      setToast("10 API calls logged");
      await loadData();
    } catch (err) {
      setToast(err?.message || "Simulation failed");
    } finally {
      setSimulating(false);
    }
  }

  return (
    <>
      <TelematicsNav title="Uber Telematics" />
      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Progressive Insurance — Telematics Dashboard
          </h1>
          <PrimaryButton onClick={handleSimulate} disabled={simulating || loading}>
            {simulating ? "Simulating…" : "Simulate 10 API Calls"}
          </PrimaryButton>
        </div>

        {loading && <LoadingState />}
        {!loading && error && <ErrorState message={error} onRetry={loadData} />}

        {!loading && !error && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <TelematicsStatCard label="Drivers with Consent" value={drivers.length} />
              <TelematicsStatCard label="Avg Portfolio Score" value={avgScore || "—"} />
              <TelematicsStatCard
                label="API Calls Today"
                value={(partner?.api_calls_today ?? 0).toLocaleString()}
              />
              <TelematicsStatCard label="Est. Premium Savings" value={premiumSavings} />
            </div>

            <TelematicsCard title="Driver Portfolio">
              <TelematicsTable
                columns={[
                  "Driver",
                  "City",
                  "Score",
                  "Grade",
                  "Braking",
                  "Speeding",
                  "Phone",
                  "Discount",
                ]}
                rows={portfolioRows}
                emptyMessage="No active drivers with consent"
              />
            </TelematicsCard>

            <TelematicsCard title="Score Distribution">
              <div className="flex items-end gap-3 sm:gap-4" style={{ minHeight: 180 }}>
                {buckets.map((b) => (
                  <div key={b.range} className="flex flex-1 flex-col items-center gap-2">
                    <span className="text-xs font-medium text-zinc-400">{b.count}</span>
                    <div
                      className={`w-full max-w-16 rounded-t ${b.color}`}
                      style={{
                        height: `${Math.max(8, (b.count / maxBucket) * 140)}px`,
                      }}
                      title={`${b.range}: ${b.count} drivers`}
                    />
                    <span className="text-center text-xs text-zinc-500">{b.range}</span>
                  </div>
                ))}
              </div>
            </TelematicsCard>

            <TelematicsCard title="Query Driver Score">
              <div className="flex flex-wrap gap-3">
                <input
                  type="text"
                  value={driverId}
                  onChange={(e) => setDriverId(e.target.value)}
                  placeholder="e.g. driver_001"
                  className="min-w-[200px] flex-1 rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white placeholder:text-zinc-600"
                />
                <PrimaryButton onClick={handleQuery} disabled={querying}>
                  {querying ? "Loading…" : "Get Score"}
                </PrimaryButton>
              </div>

              {queryResult && queryResult.status === 403 && (
                <div className="mt-4 rounded-lg border border-amber-900/50 bg-amber-950/30 p-4">
                  <p className="font-medium text-amber-400">403 — Access denied</p>
                  <p className="mt-1 text-sm text-zinc-400">{queryResult.message}</p>
                </div>
              )}

              {queryResult && queryResult.status === 404 && (
                <div className="mt-4 rounded-lg border border-amber-900/50 bg-amber-950/30 p-4">
                  <p className="font-medium text-amber-400">404 — Driver not found</p>
                  <p className="mt-1 text-sm text-zinc-400">{queryResult.message}</p>
                </div>
              )}

              {queryResult?.ok && queryResult.score && (
                <div className="mt-4 rounded-lg border border-zinc-700 bg-zinc-950/50 p-4">
                  <div className="flex flex-wrap gap-6">
                    <div>
                      <p className="text-xs text-zinc-500">Score</p>
                      <p className="text-2xl font-bold text-white">{queryResult.score.score}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">Grade</p>
                      <p className="text-xl font-bold text-white">{queryResult.score.grade}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">Percentile</p>
                      <p className="text-xl font-bold text-white">
                        {queryResult.score.percentile}
                      </p>
                    </div>
                  </div>
                  <ul className="mt-4 grid gap-2 text-sm text-zinc-300 sm:grid-cols-2">
                    <li>Speed compliance: {queryResult.score.speed_compliance}%</li>
                    <li>Smooth braking: {queryResult.score.smooth_braking}%</li>
                    <li>Smooth acceleration: {queryResult.score.smooth_acceleration}%</li>
                    <li>Phone usage: {queryResult.score.phone_usage}%</li>
                    <li>Night driving safety: {queryResult.score.night_driving_safety}%</li>
                    <li>
                      Trips / miles: {queryResult.score.trips_analyzed} /{" "}
                      {Number(queryResult.score.miles_analyzed).toLocaleString()}
                    </li>
                  </ul>
                  <p className="mt-4 text-sm text-emerald-400">
                    {queryResult.recommendation ||
                      recommendationFromScore(queryResult.score.score)}
                  </p>
                </div>
              )}
            </TelematicsCard>

            <TelematicsCard title="Webhook Feed">
              {webhooks.length === 0 ? (
                <p className="text-sm text-zinc-500">No webhook events yet</p>
              ) : (
                <ul className="space-y-3">
                  {webhooks.map((w) => {
                    const positive = (w.change ?? 0) > 0;
                    const negative = (w.change ?? 0) < 0;
                    let text = "";
                    if (w.event_type === "score_change") {
                      text = `Driver ${w.driver_id} score changed from ${w.previous_score} to ${w.new_score} (${w.change > 0 ? "+" : ""}${w.change})`;
                    } else if (w.event_type === "consent_revoked") {
                      text = `Driver ${w.driver_id} revoked data sharing consent`;
                    } else {
                      text = `${w.event_type} — ${w.driver_id}`;
                    }
                    return (
                      <li
                        key={w.id}
                        className={`rounded border border-zinc-800 px-4 py-3 text-sm ${
                          w.event_type === "consent_revoked"
                            ? "text-red-400"
                            : positive
                              ? "text-emerald-400"
                              : negative
                                ? "text-red-400"
                                : "text-zinc-300"
                        }`}
                      >
                        {text}
                        <span className="mt-1 block text-xs text-zinc-600">
                          {formatTime(w.created_at)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </TelematicsCard>
          </>
        )}
      </main>
      <Toast message={toast} onClose={() => setToast("")} />
    </>
  );
}
