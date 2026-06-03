"use client";

import { useMemo, useState } from "react";
import { formatTime } from "@/lib/telematics-utils";
import { partnerDisplayName } from "@/lib/uber-portal-constants";
import { filterLogs, logsToCsv } from "@/lib/uber-portal-utils";
import { statusCodeClass } from "@/lib/telematics-utils";
import { UberSelect, UberSecondaryButton } from "@/app/components/uber-portal-ui";
import { PrimaryButton, TelematicsCard, TelematicsTable } from "@/app/components/telematics-ui";

export default function ApiLogsTab({ logs, onToast }) {
  const [partner, setPartner] = useState("all");
  const [status, setStatus] = useState("all");
  const [endpoint, setEndpoint] = useState("all");
  const [timeRange, setTimeRange] = useState("day");
  const [expanded, setExpanded] = useState(null);

  const filtered = useMemo(
    () => filterLogs(logs, { partner, status, endpoint, timeRange }),
    [logs, partner, status, endpoint, timeRange]
  );

  function exportCsv() {
    const csv = logsToCsv(filtered);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "telematics-api-logs.csv";
    a.click();
    URL.revokeObjectURL(url);
    onToast("CSV exported successfully");
  }

  const rows = filtered.map((l) => ({
    key: l.id,
    cells: [
      <button
        key="t"
        type="button"
        onClick={() => setExpanded(expanded === l.id ? null : l.id)}
        className="text-left text-zinc-300 hover:text-white"
      >
        {formatTime(l.created_at || l.timestamp_ms)}
      </button>,
      partnerDisplayName(l.partner_id, l.partner_id),
      l.driver_id || "—",
      <span key="e" className="font-mono text-xs">{l.endpoint}</span>,
      l.method,
      <span key="s" className={statusCodeClass(l.status_code)}>{l.status_code}</span>,
      `${l.response_time_ms}ms`,
      <span key="r" className="font-mono text-xs text-zinc-500">{l.id?.slice(0, 8)}</span>,
    ],
  }));

  const expandedLog = filtered.find((l) => l.id === expanded);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">API Request Logs</h2>
          <p className="mt-2 text-zinc-500">{filtered.length} requests matching filters</p>
        </div>
        <PrimaryButton onClick={exportCsv}>Export CSV</PrimaryButton>
      </div>

      <div className="flex flex-wrap gap-3">
        <UberSelect value={partner} onChange={(e) => setPartner(e.target.value)}>
          <option value="all">All partners</option>
          <option value="progressive_ins">StateSafe Insurance</option>
          <option value="root_insurance">Sprout Insurance</option>
        </UberSelect>
        <UberSelect value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All status</option>
          <option value="2xx">2xx</option>
          <option value="4xx">4xx</option>
          <option value="5xx">5xx</option>
        </UberSelect>
        <UberSelect value={endpoint} onChange={(e) => setEndpoint(e.target.value)}>
          <option value="all">All endpoints</option>
          <option value="/score">/score</option>
          <option value="/events">/events</option>
          <option value="/summary">/summary</option>
          <option value="/fleet">/fleet</option>
        </UberSelect>
        <UberSelect value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
          <option value="hour">Last hour</option>
          <option value="day">Last 24h</option>
          <option value="week">Last 7 days</option>
        </UberSelect>
      </div>

      <TelematicsCard>
        <TelematicsTable
          columns={[
            "Time",
            "Partner",
            "Driver ID",
            "Endpoint",
            "Method",
            "Status",
            "Response Time",
            "Request ID",
          ]}
          rows={rows}
          emptyMessage="No logs match filters"
        />
      </TelematicsCard>

      {expandedLog && (
        <TelematicsCard title="Request Details">
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-zinc-500">Request headers</p>
              <pre className="mt-2 overflow-x-auto rounded border border-zinc-800 bg-[#0a0a0a] p-3 text-zinc-400">
{`Authorization: Bearer fake-token-***
Content-Type: application/json
X-Partner-ID: ${expandedLog.partner_id}`}
              </pre>
            </div>
            <div>
              <p className="text-zinc-500">Response body preview</p>
              <pre className="mt-2 overflow-x-auto rounded border border-zinc-800 bg-[#0a0a0a] p-3 text-zinc-400">
{expandedLog.status_code >= 400
  ? `{\n  "code": "${expandedLog.status_code === 403 ? "ConsentRequired" : "Error"}",\n  "message": "Request failed with status ${expandedLog.status_code}"\n}`
  : `{\n  "driver_id": "${expandedLog.driver_id || "driver_001"}",\n  "score": 82,\n  "grade": "A"\n}`}
              </pre>
            </div>
            {expandedLog.status_code >= 400 && (
              <p className="text-amber-400">
                Error: HTTP {expandedLog.status_code} on {expandedLog.endpoint}
              </p>
            )}
            <UberSecondaryButton onClick={() => setExpanded(null)}>Close</UberSecondaryButton>
          </div>
        </TelematicsCard>
      )}
    </div>
  );
}
