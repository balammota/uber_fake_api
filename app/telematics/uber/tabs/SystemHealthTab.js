"use client";

import { ENDPOINT_LATENCY } from "@/lib/uber-portal-constants";
import { errorBreakdown, latencyClass } from "@/lib/uber-portal-utils";
import { TelematicsCard, TelematicsStatCard, TelematicsTable } from "@/app/components/telematics-ui";

export default function SystemHealthTab({ logs, systemMetrics }) {
  const errors = errorBreakdown(logs);

  const endpointRows = ENDPOINT_LATENCY.map((e) => ({
    key: e.endpoint,
    cells: [
      e.endpoint,
      <span key="a" className={latencyClass(e.avg)}>{e.avg}ms</span>,
      <span key="p95" className={latencyClass(e.p95)}>{e.p95}ms</span>,
      <span key="p99" className={latencyClass(e.p99)}>{e.p99}ms</span>,
      e.calls.toLocaleString(),
    ],
  }));

  const errorRows = errors.map((e) => ({
    key: e.label,
    cells: [
      e.label,
      e.count,
      `${e.pct}%`,
      <span key="t" className={e.warn ? "text-amber-400" : "text-zinc-400"}>{e.trend}</span>,
    ],
  }));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">System Health & Infrastructure</h2>
        <p className="mt-2 text-zinc-500">Real-time API and pipeline monitoring</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <TelematicsStatCard label="API Uptime" value="99.94%" />
        <TelematicsStatCard label="Avg Latency" value="142ms" />
        <TelematicsStatCard label="P99 Latency" value="847ms" />
        <TelematicsStatCard label="Error Rate" value={`${systemMetrics.errorRate}%`} />
        <TelematicsStatCard label="CMT Pipeline" value="Live" />
        <TelematicsStatCard label="OAuth Service" value="Operational" />
      </div>

      <TelematicsCard title="Endpoint Performance">
        <TelematicsTable
          columns={["Endpoint", "Avg (ms)", "P95 (ms)", "P99 (ms)", "Calls Today"]}
          rows={endpointRows}
        />
      </TelematicsCard>

      <TelematicsCard title="Errors by Type — Last 24 Hours">
        <TelematicsTable
          columns={["Error Code", "Count", "% of Total", "Trend"]}
          rows={errorRows}
          emptyMessage="No errors in the last 24 hours"
        />
      </TelematicsCard>

      <TelematicsCard title="Cambridge Mobile Telematics Pipeline">
        <ul className="space-y-4 border-l-2 border-emerald-500/50 pl-6">
          <li className="relative">
            <span className="absolute -left-[1.6rem] top-1 h-3 w-3 rounded-full bg-emerald-500" />
            <p className="font-medium text-white">Last score update: 4 minutes ago</p>
            <p className="text-sm text-emerald-400">Processing complete</p>
          </li>
          <li className="relative">
            <span className="absolute -left-[1.6rem] top-1 h-3 w-3 rounded-full bg-zinc-600" />
            <p className="font-medium text-white">Next scheduled update: in 23h 56m</p>
          </li>
          <li className="relative">
            <span className="absolute -left-[1.6rem] top-1 h-3 w-3 rounded-full bg-emerald-500" />
            <p className="font-medium text-white">Drivers processed today: 10/10</p>
          </li>
          <li className="relative">
            <span className="absolute -left-[1.6rem] top-1 h-3 w-3 rounded-full bg-emerald-500" />
            <p className="font-medium text-white">Failed processing: 0</p>
          </li>
        </ul>
      </TelematicsCard>
    </div>
  );
}
