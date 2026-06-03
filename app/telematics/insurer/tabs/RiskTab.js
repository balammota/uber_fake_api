"use client";

import { useState } from "react";
import {
  assessmentRecommendation,
  gradeBadgeStyles,
  scoreColorClass,
} from "@/lib/statesafe-utils";
import {
  SSPrimaryButton,
  SSInput,
  SSSelect,
  SSScoreBar,
  SSBadge,
  SSCard,
  apiAuthHeaders,
} from "@/app/components/statesafe-ui";

export default function RiskTab({ onReload }) {
  const [driverId, setDriverId] = useState("");
  const [period, setPeriod] = useState("90");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  async function runAssessment() {
    const id = driverId.trim();
    if (!id) return;
    setLoading(true);
    setResult(null);
    const endpoint = `/telematics/drivers/${id}/score`;
    const start = Date.now();
    try {
      const res = await fetch(`/api/telematics/drivers/${id}/score?period=${period}`, {
        headers: apiAuthHeaders(),
      });
      const responseMs = Date.now() - start;
      const body = await res.json();

      if (res.status === 403) {
        setResult({ error: true, status: 403 });
        return;
      }
      if (!res.ok) {
        setResult({ error: true, status: res.status, message: body.message || body.error });
        return;
      }

      let events = null;
      try {
        const summaryRes = await fetch(`/api/telematics/drivers/${id}/summary`, {
          headers: apiAuthHeaders(),
        });
        if (summaryRes.ok) {
          const summary = await summaryRes.json();
          events = summary.events;
        }
      } catch {
        /* optional events */
      }

      setResult({ error: false, score: body, events });

      fetch("/api/telematics/log-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          driver_id: id,
          endpoint,
          status_code: res.status,
          response_time_ms: responseMs,
        }),
      })
        .then(() => onReload?.())
        .catch(() => {});
    } catch (err) {
      setResult({ error: true, message: err?.message || "Assessment failed" });
    } finally {
      setLoading(false);
    }
  }

  const rec = result?.score ? assessmentRecommendation(result.score.score) : null;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-[#1A1A1A]">Driver Risk Assessment Tool</h2>
        <p className="mt-2 text-[#6B7280]">Query any driver with active consent</p>
      </div>

      <SSCard>
        <div className="flex flex-wrap gap-4">
          <SSInput
            placeholder="Enter driver ID — e.g. driver_001"
            value={driverId}
            onChange={(e) => setDriverId(e.target.value)}
            className="min-w-[240px] flex-1"
          />
          <SSSelect value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="30">30 days</option>
            <option value="60">60 days</option>
            <option value="90">90 days</option>
          </SSSelect>
          <SSPrimaryButton onClick={runAssessment} disabled={loading} className="px-8">
            {loading ? "Running…" : "Run Assessment"}
          </SSPrimaryButton>
        </div>
      </SSCard>

      {result?.error && result.status === 403 && (
        <div className="rounded-lg border border-red-200 bg-[#FFF0F2] p-6">
          <p className="text-lg font-bold text-[#9B0B22]">403 — Consent Required</p>
          <p className="mt-2 text-sm text-[#333333]">
            This driver has not provided consent for data sharing. Request driver opt-in before
            querying their data.
          </p>
        </div>
      )}

      {result?.error && result.status !== 403 && (
        <div className="rounded-lg border border-red-200 bg-[#FFF0F2] p-6 text-[#9B0B22]">
          {result.message || `Error ${result.status || ""}`}
        </div>
      )}

      {result?.score && (
        <SSCard title="Assessment Results">
          <div className="flex flex-wrap items-center gap-6">
            <p className={`text-5xl font-bold ${scoreColorClass(result.score.score)}`}>
              {result.score.score}
            </p>
            <SSBadge className={gradeBadgeStyles(result.score.grade)}>{result.score.grade}</SSBadge>
            <p className="text-sm text-[#6B7280]">
              {result.score.percentile}th percentile · {result.score.period_days} day period
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <p className="font-semibold">Score breakdown</p>
            {result.score.score_breakdown &&
              Object.entries(result.score.score_breakdown).map(([key, val]) => (
                <SSScoreBar key={key} label={key.replace(/_/g, " ")} value={val} />
              ))}
          </div>

          {result.events && (
            <div className="mt-8">
              <p className="mb-3 font-semibold">Driving Events</p>
              <ul className="space-y-2 text-sm text-[#333333]">
                <li>
                  Harsh braking: {result.events.harsh_braking?.count ?? 0} events (
                  {result.events.harsh_braking?.per_100_miles ?? 0} per 100 miles)
                </li>
                <li>
                  Harsh acceleration: {result.events.harsh_acceleration?.count ?? 0} events (
                  {result.events.harsh_acceleration?.per_100_miles ?? 0} per 100 miles)
                </li>
                <li>
                  Speeding: {result.events.speeding?.count ?? 0} events (
                  {result.events.speeding?.per_100_miles ?? 0} per 100 miles)
                </li>
                <li>
                  Phone usage: {result.events.phone_usage?.count ?? 0} event (
                  {result.events.phone_usage?.per_100_miles ?? 0} per 100 miles)
                </li>
              </ul>
            </div>
          )}

          {rec && (
            <div className={`mt-8 rounded-lg border p-5 text-lg font-semibold ${rec.className}`}>
              {rec.label}
            </div>
          )}
        </SSCard>
      )}
    </div>
  );
}
