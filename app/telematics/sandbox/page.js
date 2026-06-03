"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowser } from "@/lib/supabase";
import {
  consentBadgeClass,
  formatTime,
  gradeBadgeClass,
  latestScoresByDriver,
  statusCodeClass,
} from "@/lib/telematics-utils";
import { partnerDisplayName } from "@/lib/uber-portal-constants";
import { formatTimeAgo, PARTNER_OPTIONS, SCENARIO_OPTIONS } from "@/lib/sandbox-utils";
import { ConfirmModal, SandboxFooter, SandboxNavbar } from "@/app/components/sandbox-ui";
import {
  Badge,
  ErrorState,
  LoadingState,
  TelematicsCard,
  TelematicsStatCard,
  TelematicsTable,
  Toast,
} from "@/app/components/telematics-ui";

export default function SandboxPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [partners, setPartners] = useState([]);
  const [scores, setScores] = useState([]);
  const [logs, setLogs] = useState([]);
  const [webhooks, setWebhooks] = useState([]);
  const [toast, setToast] = useState("");

  const [genLoading, setGenLoading] = useState(false);
  const [scenario, setScenario] = useState("mixed");
  const [genResults, setGenResults] = useState(null);

  const [consentDriver, setConsentDriver] = useState("");
  const [consentPartner, setConsentPartner] = useState("progressive_ins");
  const [revokeDriver, setRevokeDriver] = useState("");
  const [consentLoading, setConsentLoading] = useState(null);

  const [simLoading, setSimLoading] = useState(null);
  const [stateTab, setStateTab] = useState("drivers");
  const [confirmModal, setConfirmModal] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createSupabaseBrowser();
      const [dRes, pRes, sRes, lRes, wRes] = await Promise.all([
        supabase.from("telematics_drivers").select("*").order("driver_id"),
        supabase.from("telematics_partners").select("*"),
        supabase.from("telematics_scores").select("*").order("recorded_at", { ascending: false }),
        supabase
          .from("telematics_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("telematics_webhooks")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10),
      ]);
      if (dRes.error) throw dRes.error;
      if (pRes.error) throw pRes.error;
      if (sRes.error) throw sRes.error;
      if (lRes.error) throw lRes.error;
      if (wRes.error) throw wRes.error;
      setDrivers(dRes.data || []);
      setPartners(pRes.data || []);
      setScores(sRes.data || []);
      setLogs(lRes.data || []);
      setWebhooks(wRes.data || []);
    } catch (err) {
      setError(err?.message || "Failed to load sandbox data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const scoreMap = useMemo(() => latestScoresByDriver(scores), [scores]);
  const lastGenerated = scores[0]?.recorded_at;
  const activeDrivers = useMemo(
    () => drivers.filter((d) => d.consent_status === "active"),
    [drivers]
  );

  async function runGenerate(type, scenarioId) {
    setGenLoading(true);
    setGenResults(null);
    try {
      const res = await fetch("/api/telematics/sandbox/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, scenario: scenarioId }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Generation failed");
      setGenResults(body.results || []);
      setToast(
        body.logCount
          ? `✅ ${body.logCount} API logs generated`
          : "✅ Data generated for 10 drivers"
      );
      await loadData();
    } catch (err) {
      setToast(err?.message || "Generation failed");
    } finally {
      setGenLoading(false);
    }
  }

  async function runConsent(action, extra = {}) {
    setConsentLoading(action);
    try {
      const res = await fetch("/api/telematics/sandbox/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Action failed");
      setToast(`✅ ${body.message}`);
      await loadData();
    } catch (err) {
      setToast(err?.message || "Consent action failed");
    } finally {
      setConsentLoading(null);
      setConfirmModal(null);
    }
  }

  async function runSimulate(type) {
    setSimLoading(type);
    try {
      const res = await fetch("/api/telematics/sandbox/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Simulation failed");
      setToast(body.message || `✅ ${body.logged} API calls logged`);
      await loadData();
    } catch (err) {
      setToast(err?.message || "Simulation failed");
    } finally {
      setSimLoading(null);
    }
  }

  async function runReset() {
    try {
      const res = await fetch("/api/telematics/sandbox/reset", { method: "POST" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Reset failed");
      setGenResults(null);
      setToast("✅ Sandbox reset to default state");
      await loadData();
    } catch (err) {
      setToast(err?.message || "Reset failed");
    } finally {
      setConfirmModal(null);
    }
  }

  const resultRows = (genResults || []).map((r) => ({
    key: r.driver_id,
    cells: [
      r.driver_id,
      r.previous_score,
      r.new_score,
      r.change === 0 ? (
        <span key="c" className="text-zinc-500">—</span>
      ) : r.change > 0 ? (
        <span key="c" className="text-emerald-400">↑ +{r.change}</span>
      ) : (
        <span key="c" className="text-red-400">↓ {r.change}</span>
      ),
      r.grade,
      r.webhook_triggered ? (
        <Badge key="w" className="bg-amber-500/20 text-amber-400">Yes</Badge>
      ) : (
        "No"
      ),
    ],
  }));

  const driverStateRows = drivers.map((d) => {
    const sc = scoreMap.get(d.driver_id);
    return {
      key: d.driver_id,
      cells: [
        d.driver_id,
        d.driver_name,
        d.city,
        <Badge key="c" className={consentBadgeClass(d.consent_status)}>{d.consent_status}</Badge>,
        sc?.score ?? "—",
        sc?.grade ? (
          <Badge key="g" className={gradeBadgeClass(sc.grade)}>{sc.grade}</Badge>
        ) : (
          "—"
        ),
      ],
    };
  });

  const logRows = logs.map((l) => ({
    key: l.id,
    cells: [
      formatTime(l.created_at || l.timestamp_ms),
      partnerDisplayName(l.partner_id, l.partner_id),
      <span key="e" className="font-mono text-xs">{l.endpoint}</span>,
      <span key="s" className={statusCodeClass(l.status_code)}>{l.status_code}</span>,
      `${l.response_time_ms}ms`,
    ],
  }));

  const webhookRows = webhooks.map((w) => ({
    key: w.id,
    cells: [
      formatTime(w.created_at),
      w.event_type,
      w.driver_id,
      partnerDisplayName(w.partner_id, w.partner_id),
      w.delivered ? (
        <Badge key="d" className="bg-emerald-500/20 text-emerald-400">Yes</Badge>
      ) : (
        <Badge key="d" className="bg-zinc-700 text-zinc-400">No</Badge>
      ),
    ],
  }));

  return (
    <>
      <SandboxNavbar />
      <main className="mx-auto max-w-7xl space-y-12 px-4 py-8 sm:px-6">
        {/* Hero */}
        <section>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Telematics API Sandbox</h1>
          <p className="mt-3 max-w-2xl text-lg text-zinc-400">
            Generate test data, simulate scenarios, and validate your integration before going live
          </p>
          <div className="mt-6 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            ⚠️ Sandbox Environment — All data is synthetic. No real driver data is used or exposed here.
          </div>
          {!loading && !error && (
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <TelematicsStatCard label="Drivers in Sandbox" value={drivers.length} />
              <TelematicsStatCard
                label="Last Data Generated"
                value={lastGenerated ? formatTimeAgo(lastGenerated) : "Never"}
              />
              <TelematicsStatCard label="Insurance Partners" value={partners.length} />
            </div>
          )}
        </section>

        {loading && <LoadingState message="Loading sandbox…" />}
        {!loading && error && <ErrorState message={error} onRetry={loadData} />}

        {!loading && !error && (
          <>
            {/* Section 1 — Generator */}
            <section id="generator">
              <h2 className="text-2xl font-bold text-white">Generate Driving Data</h2>
              <p className="mt-2 text-zinc-500">
                Simulate new driving behavior scores for all drivers
              </p>

              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <TelematicsCard title="Generate Random Data">
                  <p className="mb-4 text-sm text-zinc-400">
                    Generate realistic random scores for all 10 drivers. Scores vary naturally within
                    each driver&apos;s typical range.
                  </p>
                  <button
                    type="button"
                    disabled={genLoading}
                    onClick={() => runGenerate("random")}
                    className="rounded bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                  >
                    {genLoading ? "Generating data…" : "Generate Random Scores"}
                  </button>
                </TelematicsCard>

                <TelematicsCard title="Generate Custom Scenario">
                  <p className="mb-4 text-sm text-zinc-400">
                    Choose a specific scenario to test edge cases and alert triggers.
                  </p>
                  <select
                    value={scenario}
                    onChange={(e) => setScenario(e.target.value)}
                    className="mb-4 w-full rounded border border-zinc-700 bg-[#0a0a0a] px-3 py-2 text-sm text-white"
                  >
                    {SCENARIO_OPTIONS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  <p className="mb-4 text-xs text-zinc-500">
                    {SCENARIO_OPTIONS.find((s) => s.id === scenario)?.desc}
                  </p>
                  <button
                    type="button"
                    disabled={genLoading}
                    onClick={() => runGenerate("scenario", scenario)}
                    className="rounded bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
                  >
                    {genLoading ? "Generating data…" : "Generate This Scenario"}
                  </button>
                </TelematicsCard>
              </div>

              {genResults && genResults.length > 0 && (
                <TelematicsCard title="Generation Results" className="mt-6">
                  <TelematicsTable
                    columns={[
                      "Driver",
                      "Previous Score",
                      "New Score",
                      "Change",
                      "Grade",
                      "Webhook Triggered",
                    ]}
                    rows={resultRows}
                  />
                </TelematicsCard>
              )}
            </section>

            {/* Section 2 — Consent */}
            <section>
              <h2 className="text-2xl font-bold text-white">Simulate Consent Actions</h2>
              <p className="mt-2 text-zinc-500">Test different consent states and webhook triggers</p>

              <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <TelematicsCard title="Grant Consent">
                  <p className="mb-4 text-sm text-zinc-400">
                    Simulate a driver accepting consent request
                  </p>
                  <select
                    value={consentDriver}
                    onChange={(e) => setConsentDriver(e.target.value)}
                    className="mb-3 w-full rounded border border-zinc-700 bg-[#0a0a0a] px-3 py-2 text-sm"
                  >
                    <option value="">Select driver…</option>
                    {drivers.map((d) => (
                      <option key={d.driver_id} value={d.driver_id}>
                        {d.driver_id} — {d.driver_name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={consentPartner}
                    onChange={(e) => setConsentPartner(e.target.value)}
                    className="mb-4 w-full rounded border border-zinc-700 bg-[#0a0a0a] px-3 py-2 text-sm"
                  >
                    {PARTNER_OPTIONS.map((p) => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={!consentDriver || consentLoading === "grant"}
                    onClick={() =>
                      runConsent("grant", {
                        driver_id: consentDriver,
                        partner_id: consentPartner,
                      })
                    }
                    className="rounded bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                  >
                    Grant Consent
                  </button>
                </TelematicsCard>

                <TelematicsCard title="Revoke Consent">
                  <p className="mb-4 text-sm text-zinc-400">
                    Simulate a driver revoking consent — triggers immediate webhook and alert
                  </p>
                  <select
                    value={revokeDriver}
                    onChange={(e) => setRevokeDriver(e.target.value)}
                    className="mb-4 w-full rounded border border-zinc-700 bg-[#0a0a0a] px-3 py-2 text-sm"
                  >
                    <option value="">Select active driver…</option>
                    {activeDrivers.map((d) => (
                      <option key={d.driver_id} value={d.driver_id}>
                        {d.driver_id} — {d.driver_name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={!revokeDriver || consentLoading === "revoke"}
                    onClick={() => runConsent("revoke", { driver_id: revokeDriver })}
                    className="rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
                  >
                    Revoke Consent
                  </button>
                </TelematicsCard>

                <TelematicsCard title="Reset All Consent">
                  <p className="mb-4 text-sm text-zinc-400">
                    Reset all drivers to active consent — useful for starting a clean demo
                  </p>
                  <button
                    type="button"
                    disabled={consentLoading === "reset_all"}
                    onClick={() =>
                      setConfirmModal({
                        title: "Reset all consent?",
                        message:
                          "Are you sure? This will reset all consent states to active.",
                        confirmLabel: "Reset All to Active",
                        onConfirm: () => runConsent("reset_all"),
                      })
                    }
                    className="rounded border border-zinc-600 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
                  >
                    Reset All to Active
                  </button>
                </TelematicsCard>
              </div>
            </section>

            {/* Section 3 — API Simulator */}
            <section>
              <h2 className="text-2xl font-bold text-white">Simulate API Calls</h2>
              <p className="mt-2 text-zinc-500">
                Generate realistic API traffic to populate logs and test monitoring
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-5">
                  <h3 className="font-semibold text-white">Normal Traffic</h3>
                  <p className="mt-2 text-sm text-zinc-400">
                    Simulate 20 normal API calls from StateSafe Insurance
                  </p>
                  <button
                    type="button"
                    disabled={simLoading === "normal"}
                    onClick={() => runSimulate("normal")}
                    className="mt-4 rounded bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200 disabled:opacity-50"
                  >
                    {simLoading === "normal" ? "Simulating…" : "Run Normal Traffic"}
                  </button>
                </div>

                <div className="rounded-lg border border-red-900/40 bg-red-950/20 p-5">
                  <h3 className="font-semibold text-white">Error Spike</h3>
                  <p className="mt-2 text-sm text-zinc-400">
                    30 API calls with 40% error rate — triggers CRITICAL alert
                  </p>
                  <p className="mt-2 text-xs text-amber-400">
                    ⚠️ This will trigger a CRITICAL alert in the Uber Portal
                  </p>
                  <button
                    type="button"
                    disabled={simLoading === "error_spike"}
                    onClick={() => runSimulate("error_spike")}
                    className="mt-4 rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
                  >
                    {simLoading === "error_spike" ? "Simulating…" : "Run Error Spike"}
                  </button>
                </div>

                <div className="rounded-lg border border-amber-900/40 bg-amber-950/20 p-5">
                  <h3 className="font-semibold text-white">Rate Limit Approach</h3>
                  <p className="mt-2 text-sm text-zinc-400">
                    Sets 8,500 calls today for StateSafe — triggers WARNING alert
                  </p>
                  <p className="mt-2 text-xs text-amber-400">
                    ⚠️ This will trigger a WARNING alert
                  </p>
                  <button
                    type="button"
                    disabled={simLoading === "rate_limit"}
                    onClick={() => runSimulate("rate_limit")}
                    className="mt-4 rounded bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500 disabled:opacity-50"
                  >
                    {simLoading === "rate_limit" ? "Simulating…" : "Run Rate Limit Test"}
                  </button>
                </div>
              </div>
            </section>

            {/* Section 4 — Demo Guide */}
            <section>
              <h2 className="text-2xl font-bold text-white">How to run a complete demo</h2>
              <p className="mt-2 text-zinc-500">
                Follow these steps to show the full integration from data generation to insurance pricing
              </p>

              <ol className="mt-6 space-y-4">
                {[
                  {
                    n: 1,
                    title: "Generate Data",
                    body: "Click 'Generate Random Scores' above to create fresh driving data for all 10 drivers",
                    action: (
                      <a href="#generator" className="text-sm text-amber-400 hover:text-amber-300">
                        Go to Generator ↑
                      </a>
                    ),
                  },
                  {
                    n: 2,
                    title: "View in Uber Portal",
                    body: "Open the Uber Portal as Alejandro to see updated driver scores and any alerts triggered",
                    action: (
                      <Link
                        href="/telematics/uber"
                        className="inline-block rounded bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200"
                      >
                        Open Uber Portal →
                      </Link>
                    ),
                  },
                  {
                    n: 3,
                    title: "Check as Insurer",
                    body: "Open the Insurer Portal as Sarah to see how StateSafe's portfolio changed",
                    action: (
                      <Link
                        href="/telematics/insurer"
                        className="inline-block rounded border border-zinc-600 px-4 py-2 text-sm text-white hover:bg-zinc-800"
                      >
                        Open Insurer Portal →
                      </Link>
                    ),
                  },
                  {
                    n: 4,
                    title: "Run Risk Assessment",
                    body: "In the Insurer Portal, use Risk Assessment to query a specific driver — watch the API log appear in real time in the Uber Portal",
                    note: "Open both portals side by side for maximum impact",
                  },
                  {
                    n: 5,
                    title: "Trigger an Alert",
                    body: "Generate the 'Score Degradation' scenario above to trigger a CRITICAL alert — then check the Alert Center in the Uber Portal",
                    action: (
                      <Link
                        href="/telematics/uber"
                        className="inline-block rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500"
                      >
                        Open Alert Center →
                      </Link>
                    ),
                  },
                ].map((step) => (
                  <li
                    key={step.n}
                    className="flex gap-4 rounded-lg border border-zinc-800 bg-[#111111] p-5"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-sm font-bold text-white">
                      {step.n}
                    </span>
                    <div>
                      <h3 className="font-semibold text-white">{step.title}</h3>
                      <p className="mt-1 text-sm text-zinc-400">{step.body}</p>
                      {step.note && (
                        <p className="mt-2 text-xs text-zinc-500">{step.note}</p>
                      )}
                      {step.action && <div className="mt-3">{step.action}</div>}
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {/* Section 5 — Current State */}
            <section>
              <h2 className="text-2xl font-bold text-white">Current Sandbox State</h2>
              <p className="mt-2 text-zinc-500">Live view of all data in the sandbox</p>

              <div className="mt-4 flex gap-2">
                {[
                  { id: "drivers", label: "Drivers" },
                  { id: "logs", label: "Recent API Logs" },
                  { id: "webhooks", label: "Webhook Events" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStateTab(tab.id)}
                    className={`rounded px-4 py-2 text-sm font-medium ${
                      stateTab === tab.id
                        ? "bg-white text-black"
                        : "bg-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={loadData}
                  className="ml-auto rounded border border-zinc-600 px-3 py-2 text-xs text-zinc-400 hover:text-white"
                >
                  Refresh
                </button>
              </div>

              <TelematicsCard className="mt-4">
                {stateTab === "drivers" && (
                  <TelematicsTable
                    columns={["Driver ID", "Name", "City", "Consent", "Score", "Grade"]}
                    rows={driverStateRows}
                    emptyMessage="No drivers"
                  />
                )}
                {stateTab === "logs" && (
                  <TelematicsTable
                    columns={["Time", "Partner", "Endpoint", "Status", "Response Time"]}
                    rows={logRows}
                    emptyMessage="No API logs yet"
                  />
                )}
                {stateTab === "webhooks" && (
                  <TelematicsTable
                    columns={["Time", "Event", "Driver", "Partner", "Delivered"]}
                    rows={webhookRows}
                    emptyMessage="No webhook events yet"
                  />
                )}
              </TelematicsCard>

              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={() =>
                    setConfirmModal({
                      title: "Reset sandbox?",
                      message:
                        "This will reset all scores to default values and clear all logs and webhooks. Continue?",
                      confirmLabel: "Reset Sandbox",
                      danger: true,
                      onConfirm: runReset,
                    })
                  }
                  className="rounded border border-red-800 px-6 py-3 text-sm font-medium text-red-400 hover:bg-red-950"
                >
                  Reset Sandbox to Default State
                </button>
              </div>
            </section>
          </>
        )}
      </main>

      <SandboxFooter />
      <Toast message={toast} onClose={() => setToast("")} />

      <ConfirmModal
        open={!!confirmModal}
        title={confirmModal?.title}
        message={confirmModal?.message}
        confirmLabel={confirmModal?.confirmLabel}
        danger={confirmModal?.danger}
        onConfirm={confirmModal?.onConfirm}
        onCancel={() => setConfirmModal(null)}
      />
    </>
  );
}
