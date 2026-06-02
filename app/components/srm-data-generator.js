"use client";

import { useCallback, useMemo, useState } from "react";
import {
  getMapistryApiBase,
  MAPISTRY_API_KEY,
  statusColor,
} from "@/app/components/mapistry-app-ui";

const PLANTS = [
  { id: "site_1", label: "SRM Dallas Plant" },
  { id: "site_2", label: "SRM Houston Plant" },
  { id: "site_3", label: "SRM Phoenix Plant" },
  { id: "site_4", label: "SRM Denver Plant" },
  { id: "site_5", label: "SRM Chicago Plant" },
];

const LOGS = [
  { id: "log_1", label: "Daily Emissions Log" },
  { id: "log_2", label: "Water Usage Log" },
  { id: "log_3", label: "Waste Disposal Log" },
  { id: "log_4", label: "Air Quality Log" },
  { id: "log_5", label: "Safety Inspection Log" },
];

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
  fieldValues: {
    field_1: { value: 450, units: "kg" },
  },
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
    color: "green",
    border: "border-emerald-500/40 hover:border-emerald-500/70 hover:bg-emerald-500/5",
    accent: "text-emerald-400",
  },
  {
    id: "missing",
    icon: "⚠️",
    name: "Missing Field",
    description: "Submit entry without required logDate field",
    color: "yellow",
    border: "border-yellow-500/40 hover:border-yellow-500/70 hover:bg-yellow-500/5",
    accent: "text-yellow-400",
  },
  {
    id: "wrong-type",
    icon: "❌",
    name: "Wrong Type",
    description: "Submit CO2 value as string instead of number",
    color: "red",
    border: "border-red-500/40 hover:border-red-500/70 hover:bg-red-500/5",
    accent: "text-red-400",
  },
  {
    id: "rate-limit",
    icon: "🚦",
    name: "Rate Limit Hit",
    description: "Send 10 requests rapidly to trigger 429",
    color: "orange",
    border: "border-orange-500/40 hover:border-orange-500/70 hover:bg-orange-500/5",
    accent: "text-orange-400",
  },
  {
    id: "invalid-auth",
    icon: "🔒",
    name: "Invalid Auth",
    description: "Send request with wrong API key to trigger 401",
    color: "red",
    border: "border-red-500/40 hover:border-red-500/70 hover:bg-red-500/5",
    accent: "text-red-400",
  },
  {
    id: "batch",
    icon: "📦",
    name: "Batch Upload",
    description: "Upload 5 entries at once — mix of valid and invalid",
    color: "blue",
    border: "border-blue-500/40 hover:border-blue-500/70 hover:bg-blue-500/5",
    accent: "text-blue-400",
  },
];

function resolveLogId(siteId, logKey) {
  const siteNum = siteId.replace("site_", "");
  const logNum = logKey.replace("log_", "");
  return `log_${siteNum}_${logNum}`;
}

function getPlantLabel(siteId) {
  return PLANTS.find((p) => p.id === siteId)?.label ?? siteId;
}

function getLogLabel(logId) {
  return LOGS.find((l) => l.id === logId)?.label ?? logId;
}

export default function SrmDataGenerator() {
  const [selectedSite, setSelectedSite] = useState("site_1");
  const [selectedLog, setSelectedLog] = useState("log_1");
  const [loading, setLoading] = useState(false);
  const [activeScenario, setActiveScenario] = useState(null);
  const [progress, setProgress] = useState("");
  const [batchResults, setBatchResults] = useState([]);
  const [requestLog, setRequestLog] = useState([]);
  const [expandedIds, setExpandedIds] = useState(new Set());

  const stats = useMemo(() => {
    let successful = 0;
    let failed = 0;
    let rateLimits = 0;
    requestLog.forEach((entry) => {
      if (entry.status >= 200 && entry.status < 300) successful += 1;
      else if (entry.status === 429) rateLimits += 1;
      if (entry.status >= 400) failed += 1;
    });
    return {
      total: requestLog.length,
      successful,
      failed,
      rateLimits,
    };
  }, [requestLog]);

  const addLogEntry = useCallback(
    ({ scenario, status, body, duration, retryAfter, plantId, logId }) => {
      const entry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date().toISOString(),
        scenario,
        plant: getPlantLabel(plantId ?? selectedSite),
        log: getLogLabel(logId ?? selectedLog),
        plantId: plantId ?? selectedSite,
        logId: logId ?? selectedLog,
        status,
        body,
        duration,
        retryAfter,
      };
      setRequestLog((prev) => [entry, ...prev].slice(0, 10));
      return entry;
    },
    [selectedSite, selectedLog]
  );

  const sendRequest = useCallback(
    async (body, { scenario, apiKey = MAPISTRY_API_KEY, plantId, logId } = {}) => {
      const site = plantId ?? selectedSite;
      const log = logId ?? selectedLog;
      const resolvedLog = resolveLogId(site, log);
      const base = getMapistryApiBase();
      const url = `${base}/edp/sites/${site}/logs/${resolvedLog}/entries`;
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
          plantId: site,
          logId: log,
        });

        return { status: res.status, body: responseBody, retryAfter, duration };
      } catch (err) {
        const duration = Math.round(performance.now() - start);
        addLogEntry({
          scenario,
          status: 0,
          body: { error: "network_error", message: err?.message || "Request failed" },
          duration,
          plantId: site,
          logId: log,
        });
        return { status: 0, body: { message: err?.message }, duration };
      }
    },
    [selectedSite, selectedLog, addLogEntry]
  );

  async function runScenario(scenarioId) {
    if (loading) return;
    setLoading(true);
    setActiveScenario(scenarioId);
    setProgress("");
    setBatchResults([]);

    try {
      if (scenarioId === "valid") {
        setProgress("Sending...");
        await sendRequest(VALID_BODY, { scenario: "Valid Entry" });
      } else if (scenarioId === "missing") {
        setProgress("Sending...");
        await sendRequest(MISSING_FIELD_BODY, { scenario: "Missing Field" });
      } else if (scenarioId === "wrong-type") {
        setProgress("Sending...");
        await sendRequest(WRONG_TYPE_BODY, { scenario: "Wrong Type" });
      } else if (scenarioId === "rate-limit") {
        let hit429 = false;
        for (let i = 1; i <= 10; i += 1) {
          setProgress(`Sending request ${i}/10...`);
          const result = await sendRequest(VALID_BODY, {
            scenario: "Rate Limit Hit",
          });
          if (result.status === 429) {
            hit429 = true;
            setProgress(
              `429 received — Retry-After: ${result.retryAfter ?? "unknown"}s`
            );
            break;
          }
        }
        if (!hit429) {
          setProgress("Completed 10 requests — no 429 received");
        }
      } else if (scenarioId === "invalid-auth") {
        setProgress("Sending...");
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
            scenario: `Batch Upload — ${entries[i].label}`,
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
    } catch {
      setProgress("An unexpected error occurred");
    } finally {
      setLoading(false);
      setActiveScenario(null);
    }
  }

  function toggleExpanded(id) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function clearLog() {
    setRequestLog([]);
    setBatchResults([]);
    setProgress("");
    setExpandedIds(new Set());
  }

  const selectClass =
    "mt-1 w-full rounded-lg border border-zinc-700 bg-[#0a0a0a] px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none";

  return (
    <section className="mt-10 rounded-xl border border-emerald-500/20 bg-[#111111]">
      <div className="border-b border-zinc-800 p-6">
        <h2 className="text-xl font-semibold text-white">
          SRM Concrete — Synthetic Data Generator
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Simulate real integration scenarios from SRM&apos;s 700 plants
        </p>
      </div>

      <div className="space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500">
            Plant
            <select
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              disabled={loading}
              className={selectClass}
            >
              {PLANTS.map((plant) => (
                <option key={plant.id} value={plant.id}>
                  {plant.label} ({plant.id})
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500">
            Log
            <select
              value={selectedLog}
              onChange={(e) => setSelectedLog(e.target.value)}
              disabled={loading}
              className={selectClass}
            >
              {LOGS.map((log) => (
                <option key={log.id} value={log.id}>
                  {log.label} ({log.id})
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-zinc-800 bg-[#0a0a0a] p-3 text-center">
            <p className="text-xs text-zinc-500">Total Requests</p>
            <p className="mt-1 text-xl font-semibold text-white">{stats.total}</p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-[#0a0a0a] p-3 text-center">
            <p className="text-xs text-zinc-500">Successful</p>
            <p className="mt-1 text-xl font-semibold text-emerald-400">
              {stats.successful}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-[#0a0a0a] p-3 text-center">
            <p className="text-xs text-zinc-500">Failed</p>
            <p className="mt-1 text-xl font-semibold text-red-400">{stats.failed}</p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-[#0a0a0a] p-3 text-center">
            <p className="text-xs text-zinc-500">Rate Limits Hit</p>
            <p className="mt-1 text-xl font-semibold text-orange-400">
              {stats.rateLimits}
            </p>
          </div>
        </div>

        {progress && (
          <p className="text-sm text-emerald-400">{progress}</p>
        )}

        {batchResults.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {batchResults.map((r) => (
              <span
                key={r.label}
                className="rounded-lg border border-zinc-800 bg-[#0a0a0a] px-3 py-1.5 text-sm"
              >
                {r.ok ? "✅" : "❌"} {r.label}{" "}
                <span className="text-zinc-500">({r.status})</span>
              </span>
            ))}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SCENARIOS.map((scenario) => {
            const isActive = activeScenario === scenario.id;
            return (
              <button
                key={scenario.id}
                type="button"
                disabled={loading}
                onClick={() => runScenario(scenario.id)}
                className={`rounded-xl border bg-[#0a0a0a] p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${scenario.border}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{scenario.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className={`font-medium ${scenario.accent}`}>
                      {isActive && loading ? (
                        <span className="inline-flex items-center gap-2">
                          <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Sending...
                        </span>
                      ) : (
                        scenario.name
                      )}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">{scenario.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-white">Request Log</h3>
            {requestLog.length > 0 && (
              <button
                type="button"
                onClick={clearLog}
                className="rounded-lg border border-zinc-700 px-3 py-1 text-xs text-zinc-400 hover:border-zinc-600 hover:text-white"
              >
                Clear Log
              </button>
            )}
          </div>

          {requestLog.length === 0 ? (
            <p className="rounded-lg border border-dashed border-zinc-800 py-8 text-center text-sm text-zinc-600">
              No requests yet — run a scenario to see results
            </p>
          ) : (
            <div className="space-y-3">
              {requestLog.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-lg border border-zinc-800 bg-[#0a0a0a] p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-white">{entry.scenario}</p>
                      <p className="mt-0.5 text-xs text-zinc-500">
                        {new Date(entry.timestamp).toLocaleString()} · {entry.plant} ·{" "}
                        {entry.log}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className={`font-mono font-semibold ${statusColor(entry.status)}`}>
                        {entry.status || "ERR"}
                      </span>
                      <span className="text-xs text-zinc-500">{entry.duration}ms</span>
                    </div>
                  </div>

                  {entry.retryAfter && (
                    <p className="mt-2 text-xs text-orange-400">
                      Retry-After: {entry.retryAfter}s
                    </p>
                  )}

                  {entry.body && (
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={() => toggleExpanded(entry.id)}
                        className="text-xs text-emerald-400 hover:text-emerald-300"
                      >
                        {expandedIds.has(entry.id) ? "Hide" : "Show"} response JSON
                      </button>
                      {expandedIds.has(entry.id) && (
                        <pre className="mt-2 max-h-48 overflow-auto rounded border border-zinc-800 bg-[#111111] p-3 text-xs text-zinc-400">
                          {JSON.stringify(entry.body, null, 2)}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
