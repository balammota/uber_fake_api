"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  complianceStatus,
  emissionsFromCo2,
  ErrorState,
  LoadingState,
  MapistryCard,
  mapistryFetch,
  PageHeader,
} from "@/app/components/mapistry-ui";

const DATE_RANGES = [
  { id: "7", label: "Last 7 days", days: 7 },
  { id: "30", label: "Last 30 days", days: 30 },
  { id: "90", label: "Last 90 days", days: 90 },
];

function parseEntryDate(logDate) {
  if (!logDate) return null;
  const d = new Date(logDate);
  return Number.isNaN(d.getTime()) ? null : d;
}

function avgCo2FromEntries(entries) {
  const values = entries
    .map((e) => e.fieldValues?.field_1?.value)
    .filter((v) => typeof v === "number");
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function filterByRange(entries, days) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return entries.filter((e) => {
    const d = parseEntryDate(e.logDate);
    return d && d.getTime() >= cutoff;
  });
}

export default function MapistryDashboardPage() {
  const [rangeId, setRangeId] = useState("30");
  const [siteFilter, setSiteFilter] = useState("all");
  const [stats, setStats] = useState(null);
  const [sites, setSites] = useState([]);
  const [emissionsRows, setEmissionsRows] = useState([]);
  const [recentEntries, setRecentEntries] = useState([]);
  const [calendarDays, setCalendarDays] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const days = DATE_RANGES.find((r) => r.id === rangeId)?.days ?? 30;

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [statsRes, sitesRes, entriesRes] = await Promise.all([
        mapistryFetch("/sites/stats"),
        mapistryFetch("/sites?page[size]=100"),
        mapistryFetch("/edp/sites/site_1/logs/log_1_1/entries?page[size]=100"),
      ]);

      if (!statsRes.res.ok) throw new Error(statsRes.body?.message || "Failed to load stats");
      if (!sitesRes.res.ok) throw new Error(sitesRes.body?.message || "Failed to load sites");

      const siteList = sitesRes.body?.data || [];
      setStats(statsRes.body);
      setSites(siteList);

      const recent = (entriesRes.body?.data || []).slice(0, 10).map((e) => ({
        ...e,
        siteName: siteList.find((s) => s.id === "site_1")?.name || "site_1",
      }));
      setRecentEntries(recent);

      const rows = await Promise.all(
        siteList.map(async (site) => {
          const logId = `log_${site.id.replace("site_", "")}_1`;
          const { res, body } = await mapistryFetch(
            `/edp/sites/${site.id}/logs/${logId}/entries?page[size]=100`
          );
          const entries = res.ok ? filterByRange(body?.data || [], days) : [];
          const co2 = avgCo2FromEntries(entries);
          const em = emissionsFromCo2(co2);
          const status = complianceStatus(co2);
          return {
            siteId: site.id,
            plant: site.name,
            co2: em.co2,
            nox: em.nox,
            so2: em.so2,
            pm10: em.pm10,
            status,
          };
        })
      );

      setEmissionsRows(rows);

      const cal = {};
      const allEntries = entriesRes.body?.data || [];
      allEntries.forEach((e) => {
        const d = parseEntryDate(e.logDate);
        if (d) {
          const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
          cal[key] = "submitted";
        }
      });
      setCalendarDays(cal);
    } catch (err) {
      setError(err?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredRows = useMemo(() => {
    if (siteFilter === "all") return emissionsRows;
    return emissionsRows.filter((r) => r.siteId === siteFilter);
  }, [emissionsRows, siteFilter]);

  const complianceRate = useMemo(() => {
    if (!emissionsRows.length) return 0;
    const compliant = emissionsRows.filter((r) => r.co2 <= 600).length;
    return Math.round((compliant / emissionsRows.length) * 1000) / 10;
  }, [emissionsRows]);

  const maxCo2 = useMemo(
    () => Math.max(...filteredRows.map((r) => r.co2), 1),
    [filteredRows]
  );

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay();

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <PageHeader
          title="Environmental Dashboard"
          subtitle="Real-time compliance monitoring across SRM Concrete facilities"
        />
        <LoadingState message="Loading dashboard data..." />
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <PageHeader title="Environmental Dashboard" subtitle="" />
        <ErrorState message={error} onRetry={loadData} />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
      <PageHeader
        title="Environmental Dashboard"
        subtitle="Real-time compliance monitoring across SRM Concrete facilities"
      >
        <div className="mt-4 flex flex-wrap gap-2">
          {DATE_RANGES.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRangeId(r.id)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                rangeId === r.id
                  ? "bg-[#2D7A4F] text-white"
                  : "border border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#2D7A4F]"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </PageHeader>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MapistryCard>
          <p className="text-xs font-medium uppercase tracking-wider text-[#6B7280]">
            Total Sites
          </p>
          <p className="mt-1 text-2xl font-bold text-[#1A1A1A]">{stats?.totalSites ?? 10}</p>
        </MapistryCard>
        <MapistryCard>
          <p className="text-xs font-medium uppercase tracking-wider text-[#6B7280]">
            Compliance Rate
          </p>
          <p className="mt-1 text-2xl font-bold text-[#2D7A4F]">{complianceRate}%</p>
        </MapistryCard>
        <MapistryCard>
          <p className="text-xs font-medium uppercase tracking-wider text-[#6B7280]">
            Active Logs
          </p>
          <p className="mt-1 text-2xl font-bold text-[#1A1A1A]">{stats?.activeLogs ?? 50}</p>
        </MapistryCard>
        <MapistryCard>
          <p className="text-xs font-medium uppercase tracking-wider text-[#6B7280]">
            Avg CO₂
          </p>
          <p className="mt-1 text-2xl font-bold text-[#1A1A1A]">
            {stats?.avgCO2 ?? 0} <span className="text-base font-normal text-[#6B7280]">kg/day</span>
          </p>
        </MapistryCard>
      </div>

      <div className="mb-6">
        <label className="text-sm font-medium text-[#6B7280]">
          Facility
          <select
            value={siteFilter}
            onChange={(e) => setSiteFilter(e.target.value)}
            className="ml-3 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#1A1A1A] focus:border-[#2D7A4F] focus:outline-none focus:ring-1 focus:ring-[#2D7A4F]"
          >
            <option value="all">All Sites</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <MapistryCard className="mb-8">
        <h2 className="text-lg font-bold text-[#1A1A1A]">Emissions by Facility</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#E5E7EB] text-xs uppercase text-[#6B7280]">
                <th className="pb-3 pr-4 font-medium">Plant</th>
                <th className="pb-3 pr-4 font-medium">CO₂ (kg)</th>
                <th className="pb-3 pr-4 font-medium">NOx (kg)</th>
                <th className="pb-3 pr-4 font-medium">SO₂ (kg)</th>
                <th className="pb-3 pr-4 font-medium">PM10 (kg)</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row.siteId} className="border-b border-[#E5E7EB] last:border-0">
                  <td className="py-3 pr-4 font-medium text-[#1A1A1A]">{row.plant}</td>
                  <td className="py-3 pr-4">{row.co2.toFixed(2)}</td>
                  <td className="py-3 pr-4">{row.nox.toFixed(2)}</td>
                  <td className="py-3 pr-4">{row.so2.toFixed(2)}</td>
                  <td className="py-3 pr-4">{row.pm10.toFixed(2)}</td>
                  <td className={`py-3 font-medium ${row.status.className}`}>
                    {row.status.emoji} {row.status.label}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </MapistryCard>

      <MapistryCard className="mb-8">
        <h2 className="text-lg font-bold text-[#1A1A1A]">CO₂ by Facility</h2>
        <div className="mt-6 space-y-4">
          {filteredRows.map((row) => {
            const pct = Math.min(100, (row.co2 / maxCo2) * 100);
            const exceeds = row.co2 > 800;
            const near = row.co2 > 600 && !exceeds;
            return (
              <div key={row.siteId}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium text-[#1A1A1A]">{row.plant}</span>
                  <span className="text-[#6B7280]">{row.co2.toFixed(2)} kg</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-[#F7F8F5]">
                  <div
                    className={`h-full rounded-full transition-all ${
                      exceeds
                        ? "bg-red-600"
                        : near
                          ? "bg-amber-500"
                          : "bg-[#2D7A4F]"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </MapistryCard>

      <div className="grid gap-8 lg:grid-cols-2">
        <MapistryCard>
          <h2 className="text-lg font-bold text-[#1A1A1A]">Recent Entries</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB] text-xs uppercase text-[#6B7280]">
                  <th className="pb-2 pr-3">Date</th>
                  <th className="pb-2 pr-3">Site</th>
                  <th className="pb-2 pr-3">Inspector</th>
                  <th className="pb-2 pr-3">CO₂</th>
                  <th className="pb-2 pr-3">Passed</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentEntries.map((e) => {
                  const co2 = e.fieldValues?.field_1?.value;
                  const st = complianceStatus(typeof co2 === "number" ? co2 : 0);
                  return (
                    <tr key={e.id} className="border-b border-[#E5E7EB]">
                      <td className="py-2 pr-3 text-xs">{e.logDate}</td>
                      <td className="py-2 pr-3 text-xs">{e.siteName}</td>
                      <td className="py-2 pr-3 text-xs">{e.createdBy}</td>
                      <td className="py-2 pr-3">
                        {co2} {e.fieldValues?.field_1?.units}
                      </td>
                      <td className="py-2 pr-3">
                        {e.fieldValues?.field_4?.value ? "Yes" : "No"}
                      </td>
                      <td className={`py-2 text-xs ${st.className}`}>
                        {st.emoji} {e.isComplete ? "Complete" : "Draft"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </MapistryCard>

        <MapistryCard>
          <h2 className="text-lg font-bold text-[#1A1A1A]">Compliance Calendar</h2>
          <p className="mt-1 text-sm text-[#6B7280]">
            {now.toLocaleString("default", { month: "long", year: "numeric" })}
          </p>
          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <div key={d} className="py-1 font-medium text-[#6B7280]">
                {d}
              </div>
            ))}
            {Array.from({ length: firstWeekday }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const cellDate = new Date(year, month, day);
              const key = `${year}-${month}-${day}`;
              const isFuture = cellDate > now;
              const hasEntry = calendarDays[key] === "submitted";
              let bg = "bg-red-100 text-red-700";
              if (isFuture) bg = "bg-zinc-100 text-zinc-400";
              else if (hasEntry) bg = "bg-[#E8F5EE] text-[#2D7A4F]";

              return (
                <div
                  key={day}
                  className={`rounded-md py-2 text-xs font-medium ${bg}`}
                  title={
                    isFuture
                      ? "Future"
                      : hasEntry
                        ? "Entry submitted"
                        : "Entry missing"
                  }
                >
                  {day}
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-[#6B7280]">
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded bg-[#E8F5EE]" /> Submitted
            </span>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded bg-red-100" /> Missing
            </span>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded bg-zinc-100" /> Future
            </span>
          </div>
        </MapistryCard>
      </div>
    </main>
  );
}
