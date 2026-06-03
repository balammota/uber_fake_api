"use client";

import { PIPELINE_ROWS } from "@/lib/uber-portal-constants";
import { stageBadgeClass } from "@/lib/uber-portal-utils";
import { Badge, TelematicsCard, TelematicsStatCard, TelematicsTable } from "@/app/components/telematics-ui";

export default function PartnerPipelineTab({ partners }) {
  const liveCount = partners.filter((p) => p.status === "active").length;

  const rows = PIPELINE_ROWS.map((r) => ({
    key: r.company,
    cells: [
      r.company,
      <Badge key="s" className={stageBadgeClass(r.stage)}>{r.stage}</Badge>,
      r.drivers,
      r.mrr,
      r.owner,
      r.next,
    ],
  }));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Partner Pipeline</h2>
        <p className="mt-2 text-zinc-500">Track partner acquisition from prospect to live</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <TelematicsStatCard label="In Discussion" value={5} />
        <TelematicsStatCard label="In Technical Review" value={3} />
        <TelematicsStatCard label="In Legal/Contract" value={2} />
        <TelematicsStatCard label="Live" value={liveCount} />
      </div>

      <TelematicsCard title="Pipeline">
        <TelematicsTable
          columns={["Company", "Stage", "Est. Drivers", "Est. MRR", "Owner", "Next Step"]}
          rows={rows}
        />
      </TelematicsCard>
    </div>
  );
}
