"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getMapistryApiBase,
  MapistryCard,
  mapistryFetch,
  MAPISTRY_API_KEY,
  PageHeader,
  resolveLogId,
  statusCodeClass,
} from "@/app/components/mapistry-ui";
import {
  formatLastUploaded,
  generateProductionForPlants,
  productionRowToSupabase,
} from "@/lib/srm-production";
import { createSupabaseBrowser } from "@/lib/supabase";

const VALID_BODY = {
  logDate: "2025-06-01T08:00",
  isComplete: true,
  fieldValues: {
    field_1: { value: 450, units: "kg" },
    field_2: { value: "2025-06-01" },
    field_3: { value: "All systems normal at SRM plant" },
    field_4: { value: true },
  },
};

const MISSING_FIELD_BODY = {
  isComplete: true,
  fieldValues: { field_1: { value: 450, units: "kg" } },
};

const WRONG_TYPE_BODY = {
  logDate: "2025-06-01T08:00",
  isComplete: true,
  fieldValues: {
    field_1: { value: "450kg", units: "kg" },
    field_2: { value: "2025-06-01" },
    field_4: { value: true },
  },
};

const SCENARIOS = [
  {
    id: "valid",
    icon: "✅",
    name: "Valid Entry",
    description: "Submit a complete, valid emissions entry",
    style: "border-[#2D7A4F]/40 hover:bg-[#E8F5EE]",
    accent: "text-[#2D7A4F]",
  },
  {
    id: "missing",
    icon: "⚠️",
    name: "Missing Field",
    description: "Submit entry without required logDate field",
    style: "border-amber-300 hover:bg-amber-50",
    accent: "text-amber-700",
  },
  {
    id: "wrong-type",
    icon: "❌",
    name: "Wrong Type",
    description: "Submit CO2 value as string instead of number",
    style: "border-red-300 hover:bg-red-50",
    accent: "text-red-600",
  },
  {
    id: "rate-limit",
    icon: "🚦",
    name: "Rate Limit Hit",
    description: "Send 10 requests rapidly to trigger 429",
    style: "border-orange-300 hover:bg-orange-50",
    accent: "text-orange-600",
  },
  {
    id: "invalid-auth",
    icon: "🔒",
    name: "Invalid Auth",
    description: "Send request with wrong API key to trigger 401",
    style: "border-red-300 hover:bg-red-50",
    accent: "text-red-600",
  },
  {
    id: "batch",
    icon: "📦",
    name: "Batch Upload",
    description: "Upload 5 entries — mix of valid and invalid",
    style: "border-blue-300 hover:bg-blue-50",
    accent: "text-blue-600",
  },
];

export default function SrmGeneratorPage() {
  const [plants, setPlants] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selectedSite, setSelectedSite] = useState("");
  const [selectedLog, setSelectedLog] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeScenario, setActiveScenario] = useState(null);
  const [progress, setProgress] = useState("");
  const [batchResults, setBatchResults] = useState([]);
  const [requestLog, setRequestLog] = useState([]);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [initLoading, setInitLoading] = useState(true);
  const [previewData, setPreviewData] = useState([]);
  const [productionLoading, setProductionLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [lastUploaded, setLastUploaded] = useState(null);
  const [toast, setToast] = useState(null);

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  }

  const fetchLastUploaded = useCallback(async () => {
    try {
      const supabase = createSupabaseBrowser();
      const { data, error } = await supabase
        .from("srm_production")
        .select("created_at")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!error && data?.created_at) {
        setLastUploaded(data.created_at);
      }
    } catch {
      /* ignore — table may not exist yet */
    }
  }, []);

  useEffect(() => {
    fetchLastUploaded();
  }, [fetchLastUploaded]);

  useEffect(() => {
    async function loadPlants() {
      const { res, body } = await mapistryFetch("/sites?page[size]=100");
      if (res.ok && body?.data?.length) {
        setPlants(body.data);
        setSelectedSite(body.data[0].id);
      }
      setInitLoading(false);
    }
    loadPlants();
  }, []);

  useEffect(() => {
    if (!selectedSite) return;
    async function loadLogs() {
      const { res, body } = await mapistryFetch(`/edp/sites/${selectedSite}/logs`);
      if (res.ok && body?.data?.length) {
        setLogs(body.data);
        setSelectedLog(body.data[0].id);
      } else {
        setLogs([]);
        setSelectedLog("");
      }
    }
    loadLogs();
  }, [selectedSite]);

  const stats = useMemo(() => {
    let successful = 0;
    let failed = 0;
    let rateLimits = 0;
    requestLog.forEach((e) => {
      if (e.status >= 200 && e.status < 300) successful += 1;
      else if (e.status === 429) rateLimits += 1;
      if (e.status >= 400) failed += 1;
    });
    return { total: requestLog.length, successful, failed, rateLimits };
  }, [requestLog]);

  const plantLabel = plants.find((p) => p.id === selectedSite)?.name ?? selectedSite;
  const logLabel = logs.find((l) => l.id === selectedLog)?.name ?? selectedLog;

  const addLogEntry = useCallback(
    ({ scenario, status, body, duration, retryAfter }) => {
      setRequestLog((prev) =>
        [
          {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            timestamp: new Date().toISOString(),
            scenario,
            plant: plantLabel,
            log: logLabel,
            status,
            body,
            duration,
            retryAfter,
          },
          ...prev,
        ].slice(0, 10)
      );
    },
    [plantLabel, logLabel]
  );

  const sendRequest = useCallback(
    async (body, { scenario, apiKey = MAPISTRY_API_KEY } = {}) => {
      const logId = selectedLog.includes("_")
        ? selectedLog
        : resolveLogId(selectedSite, selectedLog);
      const base = getMapistryApiBase();
      const url = `${base}/edp/sites/${selectedSite}/logs/${logId}/entries`;
      const start = performance.now();

      try {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
          },
          body: JSON.stringify(body),
        });
        const retryAfter = res.headers.get("Retry-After");
        let responseBody = null;
        const text = await res.text();
        if (text) {
          try {
            responseBody = JSON.parse(text);
          } catch {
            responseBody = { message: text };
          }
        }
        const duration = Math.round(performance.now() - start);
        addLogEntry({
          scenario,
          status: res.status,
          body: responseBody,
          duration,
          retryAfter,
        });
        return { status: res.status, body: responseBody, retryAfter, duration };
      } catch (err) {
        const duration = Math.round(performance.now() - start);
        addLogEntry({
          scenario,
          status: 0,
          body: { message: err?.message },
          duration,
        });
        return { status: 0, body: null, duration };
      }
    },
    [selectedSite, selectedLog, addLogEntry]
  );

  function handleGenerateProduction() {
    if (!plants.length || productionLoading || uploadLoading) return;
    setProductionLoading(true);
    try {
      const generated = generateProductionForPlants(plants);
      setPreviewData(generated);
      setUploadProgress("");
    } finally {
      setProductionLoading(false);
    }
  }

  async function handleUploadToSupabase() {
    if (!previewData.length || uploadLoading || productionLoading) return;
    setUploadLoading(true);
    setUploadProgress("");

    try {
      const supabase = createSupabaseBrowser();
      const total = previewData.length;

      for (let i = 0; i < total; i += 1) {
        setUploadProgress(`Uploading ${i + 1}/${total}...`);
        const { error } = await supabase
          .from("srm_production")
          .insert(productionRowToSupabase(previewData[i]));

        if (error) {
          throw new Error(error.message);
        }
      }

      showToast(`${total} records saved to Supabase`, "success");
      setPreviewData([]);
      await fetchLastUploaded();
    } catch (err) {
      showToast(err?.message || "Upload failed", "error");
    } finally {
      setUploadLoading(false);
      setUploadProgress("");
    }
  }

  async function runScenario(scenarioId) {
    if (loading || uploadLoading || productionLoading || !selectedSite || !selectedLog) return;
    setLoading(true);
    setActiveScenario(scenarioId);
    setProgress("");
    setBatchResults([]);

    try {
      if (scenarioId === "valid") {
        setProgress("Sending...");
        await sendRequest(VALID_BODY, { scenario: "Valid Entry" });
      } else if (scenarioId === "missing") {
        await sendRequest(MISSING_FIELD_BODY, { scenario: "Missing Field" });
      } else if (scenarioId === "wrong-type") {
        await sendRequest(WRONG_TYPE_BODY, { scenario: "Wrong Type" });
      } else if (scenarioId === "rate-limit") {
        let hit429 = false;
        for (let i = 1; i <= 10; i += 1) {
          setProgress(`Sending request ${i}/10...`);
          const result = await sendRequest(VALID_BODY, { scenario: "Rate Limit Hit" });
          if (result.status === 429) {
            hit429 = true;
            setProgress(`429 — Retry-After: ${result.retryAfter ?? "?"}s`);
            break;
          }
        }
        if (!hit429) setProgress("Completed 10 requests — no 429 received");
      } else if (scenarioId === "invalid-auth") {
        await sendRequest(VALID_BODY, {
          scenario: "Invalid Auth",
          apiKey: "wrong-api-key-123",
        });
      } else if (scenarioId === "batch") {
        const entries = [
          { label: "Entry 1", body: VALID_BODY },
          { label: "Entry 2", body: MISSING_FIELD_BODY },
          { label: "Entry 3", body: VALID_BODY },
          { label: "Entry 4", body: WRONG_TYPE_BODY },
          { label: "Entry 5", body: VALID_BODY },
        ];
        const results = [];
        for (let i = 0; i < entries.length; i += 1) {
          setProgress(`Uploading ${i + 1}/5...`);
          const result = await sendRequest(entries[i].body, {
            scenario: `Batch — ${entries[i].label}`,
          });
          results.push({
            label: entries[i].label,
            ok: result.status >= 200 && result.status < 300,
            status: result.status,
          });
        }
        setBatchResults(results);
        setProgress("Batch upload complete");
      }
    } finally {
      setLoading(false);
      setActiveScenario(null);
    }
  }

  const selectClass =
    "mt-1 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#1A1A1A] focus:border-[#2D7A4F] focus:outline-none focus:ring-1 focus:ring-[#2D7A4F]";

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-[#E8F5EE] px-3 py-1 text-xs font-semibold text-[#2D7A4F]">
          SRM Concrete × Mapistry
        </span>
      </div>

      <PageHeader
        title="SRM Concrete — Data Integration"
        subtitle="Synthetic data generator for 700+ facilities"
      />

      {toast && (
        <div
          className={`mb-6 rounded-lg border px-4 py-3 text-sm font-medium ${
            toast.type === "success"
              ? "border-[#2D7A4F]/40 bg-[#E8F5EE] text-[#2D7A4F]"
              : "border-red-300 bg-red-50 text-red-700"
          }`}
          role="status"
        >
          {toast.message}
        </div>
      )}

      {initLoading ? (
        <div className="py-12 text-center text-sm text-[#6B7280]">Loading plants...</div>
      ) : (
        <>
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <MapistryCard className="text-center">
              <p className="text-xs text-[#6B7280]">Total Submitted</p>
              <p className="mt-1 text-2xl font-bold">{stats.total}</p>
            </MapistryCard>
            <MapistryCard className="text-center">
              <p className="text-xs text-[#6B7280]">Successful</p>
              <p className="mt-1 text-2xl font-bold text-[#2D7A4F]">{stats.successful}</p>
            </MapistryCard>
            <MapistryCard className="text-center">
              <p className="text-xs text-[#6B7280]">Failed</p>
              <p className="mt-1 text-2xl font-bold text-red-600">{stats.failed}</p>
            </MapistryCard>
            <MapistryCard className="text-center">
              <p className="text-xs text-[#6B7280]">Rate Limits</p>
              <p className="mt-1 text-2xl font-bold text-orange-600">{stats.rateLimits}</p>
            </MapistryCard>
          </div>

          <div className="mb-8 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-[#6B7280]">
              Plant
              <select
                value={selectedSite}
                onChange={(e) => setSelectedSite(e.target.value)}
                disabled={loading}
                className={selectClass}
              >
                {plants.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.id})
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium text-[#6B7280]">
              Log
              <select
                value={selectedLog}
                onChange={(e) => setSelectedLog(e.target.value)}
                disabled={loading || !logs.length}
                className={selectClass}
              >
                {logs.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.id})
                  </option>
                ))}
              </select>
            </label>
          </div>

          <section className="mb-10">
            <h2 className="text-lg font-bold text-[#1A1A1A]">Production Data</h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              Generate plant production metrics, preview emissions, then save to Supabase
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleGenerateProduction}
                disabled={productionLoading || uploadLoading || !plants.length}
                className="flex items-start gap-3 rounded-xl border-2 border-[#2D7A4F]/40 bg-white p-5 text-left shadow-sm transition-all hover:border-[#2D7A4F] hover:bg-[#E8F5EE] disabled:opacity-50"
              >
                <span className="text-2xl">⚙️</span>
                <div>
                  <p className="font-bold text-[#2D7A4F]">
                    {productionLoading ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#2D7A4F] border-t-transparent" />
                        Generating...
                      </span>
                    ) : (
                      "Generate Production Data"
                    )}
                  </p>
                  <p className="mt-1 text-xs text-[#6B7280]">
                    Generate synthetic production data for all 10 SRM plants
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={handleUploadToSupabase}
                disabled={
                  uploadLoading ||
                  productionLoading ||
                  previewData.length === 0
                }
                className="flex items-start gap-3 rounded-xl border-2 border-[#2D7A4F]/40 bg-[#2D7A4F] p-5 text-left text-white shadow-sm transition-all hover:bg-[#256b44] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#2D7A4F]"
              >
                <span className="text-2xl">☁️</span>
                <div>
                  <p className="font-bold">
                    {uploadLoading ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Uploading...
                      </span>
                    ) : (
                      "Upload to Supabase"
                    )}
                  </p>
                  <p className="mt-1 text-xs text-white/90">
                    Save generated data to SRM database
                  </p>
                </div>
              </button>
            </div>

            {uploadProgress && (
              <p className="mt-3 text-sm font-medium text-[#2D7A4F]">{uploadProgress}</p>
            )}

            {lastUploaded && (
              <p className="mt-2 text-sm text-[#6B7280]">
                Last uploaded: {formatLastUploaded(lastUploaded)}
              </p>
            )}

            {previewData.length > 0 && (
              <div className="mt-6 overflow-x-auto rounded-xl border border-[#E5E7EB] shadow-sm">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead>
                    <tr className="bg-[#2D7A4F] text-xs font-semibold uppercase tracking-wide text-white">
                      <th className="px-4 py-3">Plant</th>
                      <th className="px-4 py-3">Cement (tons)</th>
                      <th className="px-4 py-3">Fuel (L)</th>
                      <th className="px-4 py-3">Electricity (kWh)</th>
                      <th className="px-4 py-3">Shift</th>
                      <th className="px-4 py-3">Notes</th>
                      <th className="px-4 py-3">CO₂ (kg)</th>
                      <th className="px-4 py-3">NOx (kg)</th>
                      <th className="px-4 py-3">SO₂ (kg)</th>
                      <th className="px-4 py-3">PM10 (kg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, idx) => (
                      <tr
                        key={row.site_id}
                        className={idx % 2 === 0 ? "bg-white" : "bg-[#F7F8F5]"}
                      >
                        <td className="px-4 py-3 font-medium text-[#1A1A1A]">
                          {row.site_name}
                        </td>
                        <td className="px-4 py-3">{row.cement_produced_tons}</td>
                        <td className="px-4 py-3">
                          {row.fuel_consumed_liters.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          {row.electricity_kwh.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 capitalize">{row.shift}</td>
                        <td className="max-w-[180px] px-4 py-3 text-xs text-[#6B7280]">
                          {row.operator_notes}
                        </td>
                        <td className="px-4 py-3 font-medium text-[#2D7A4F]">
                          {row.emissions.co2.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">{row.emissions.nox}</td>
                        <td className="px-4 py-3">{row.emissions.so2}</td>
                        <td className="px-4 py-3">{row.emissions.pm10}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="border-t border-[#E5E7EB] bg-[#F7F8F5] px-4 py-2 text-xs text-[#6B7280]">
                  Preview only — click Upload to Supabase to persist
                </p>
              </div>
            )}
          </section>

          <h2 className="mb-4 text-lg font-bold text-[#1A1A1A]">API Scenario Tests</h2>

          {progress && (
            <p className="mb-4 text-sm font-medium text-[#2D7A4F]">{progress}</p>
          )}

          {batchResults.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {batchResults.map((r) => (
                <span
                  key={r.label}
                  className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-1 text-sm"
                >
                  {r.ok ? "✅" : "❌"} {r.label} ({r.status})
                </span>
              ))}
            </div>
          )}

          <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SCENARIOS.map((s) => {
              const isActive = activeScenario === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  disabled={loading || uploadLoading || productionLoading}
                  onClick={() => runScenario(s.id)}
                  className={`rounded-xl border-2 bg-white p-5 text-left shadow-sm transition-all hover:shadow-md disabled:opacity-50 ${s.style}`}
                >
                  <span className="text-2xl">{s.icon}</span>
                  <p className={`mt-2 font-bold ${s.accent}`}>
                    {isActive && loading ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Sending...
                      </span>
                    ) : (
                      s.name
                    )}
                  </p>
                  <p className="mt-1 text-xs text-[#6B7280]">{s.description}</p>
                </button>
              );
            })}
          </div>

          <MapistryCard>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#1A1A1A]">Request Log</h2>
              {requestLog.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setRequestLog([]);
                    setBatchResults([]);
                    setExpandedIds(new Set());
                  }}
                  className="text-sm text-[#6B7280] hover:text-[#2D7A4F]"
                >
                  Clear Log
                </button>
              )}
            </div>
            {requestLog.length === 0 ? (
              <p className="py-8 text-center text-sm text-[#6B7280]">
                No requests yet — run a scenario
              </p>
            ) : (
              <div className="space-y-3">
                {requestLog.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-lg border border-[#E5E7EB] bg-[#F7F8F5] p-4"
                  >
                    <div className="flex flex-wrap justify-between gap-2">
                      <div>
                        <p className="font-medium text-[#1A1A1A]">{entry.scenario}</p>
                        <p className="text-xs text-[#6B7280]">
                          {new Date(entry.timestamp).toLocaleString()} · {entry.plant} ·{" "}
                          {entry.log}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <span className={`font-mono font-bold ${statusCodeClass(entry.status)}`}>
                          {entry.status || "ERR"}
                        </span>
                        <span className="ml-2 text-[#6B7280]">{entry.duration}ms</span>
                      </div>
                    </div>
                    {entry.retryAfter && (
                      <p className="mt-1 text-xs text-orange-600">
                        Retry-After: {entry.retryAfter}s
                      </p>
                    )}
                    {entry.body && (
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setExpandedIds((prev) => {
                              const next = new Set(prev);
                              if (next.has(entry.id)) next.delete(entry.id);
                              else next.add(entry.id);
                              return next;
                            });
                          }}
                          className="text-xs font-medium text-[#2D7A4F] hover:underline"
                        >
                          {expandedIds.has(entry.id) ? "Hide" : "Show"} JSON
                        </button>
                        {expandedIds.has(entry.id) && (
                          <pre className="mt-2 max-h-40 overflow-auto rounded bg-white p-3 text-xs text-[#1A1A1A]">
                            {JSON.stringify(entry.body, null, 2)}
                          </pre>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </MapistryCard>
        </>
      )}
    </main>
  );
}
