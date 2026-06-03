"use client";

import { consentBadgeClass, formatTime, gradeBadgeClass } from "@/lib/telematics-utils";
import { consentByCity, driverPartnerBadges } from "@/lib/uber-portal-utils";
import { Badge, TelematicsCard, TelematicsStatCard, TelematicsTable } from "@/app/components/telematics-ui";

export default function DriverConsentTab({ drivers, scoreMap }) {
  const active = drivers.filter((d) => d.consent_status === "active").length;
  const pending = drivers.filter((d) => d.consent_status === "pending").length;
  const revoked = drivers.filter((d) => d.consent_status === "revoked").length;
  const cities = consentByCity(drivers, scoreMap);

  const driverRows = drivers.map((d) => {
    const sc = scoreMap.get(d.driver_id);
    const badges = driverPartnerBadges(d.driver_id);
    return {
      key: d.driver_id,
      cells: [
        <span key="id" className="font-mono text-xs">{d.driver_id}</span>,
        d.driver_name,
        d.city,
        <Badge key="c" className={consentBadgeClass(d.consent_status)}>{d.consent_status}</Badge>,
        sc?.score ?? "—",
        sc?.grade ? (
          <Badge key="g" className={gradeBadgeClass(sc.grade)}>{sc.grade}</Badge>
        ) : (
          "—"
        ),
        <span key="p" className="flex flex-wrap gap-1">
          {badges.map((b) => (
            <Badge key={b} className="bg-zinc-800 text-zinc-300">{b}</Badge>
          ))}
        </span>,
        sc?.recorded_at ? formatTime(sc.recorded_at) : "—",
      ],
    };
  });

  const cityRows = cities.map((c) => ({
    key: c.city,
    cells: [c.city, c.total, c.active, c.pending, c.revoked, c.avgScore],
  }));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Driver Consent Overview</h2>
        <p className="mt-2 text-zinc-500">Track consent status across the driver portfolio</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <TelematicsStatCard label="Active" value={active} />
        <TelematicsStatCard label="Pending" value={pending} />
        <TelematicsStatCard label="Revoked" value={revoked} />
      </div>

      <TelematicsCard title="All Drivers">
        <TelematicsTable
          columns={[
            "Driver ID",
            "Name",
            "City",
            "Consent Status",
            "Score",
            "Grade",
            "Partners",
            "Last Updated",
          ]}
          rows={driverRows}
          emptyMessage="No drivers"
        />
      </TelematicsCard>

      <TelematicsCard title="Consent by City">
        <TelematicsTable
          columns={["City", "Total", "Active", "Pending", "Revoked", "Avg Score"]}
          rows={cityRows}
          emptyMessage="No city data"
        />
      </TelematicsCard>
    </div>
  );
}
