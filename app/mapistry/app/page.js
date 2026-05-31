"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  EmptyBlock,
  ErrorBlock,
  LoadingBlock,
  MapistryAppNav,
  mapistryFetch,
  StatCard,
  ToastContainer,
  useToasts,
} from "@/app/components/mapistry-app-ui";

const PAGE_SIZE = 10;

export default function MapistryAppPage() {
  const { toasts, addToast, dismiss } = useToasts();

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);

  const [sites, setSites] = useState([]);
  const [sitesLoading, setSitesLoading] = useState(true);
  const [sitesError, setSitesError] = useState(null);
  const [search, setSearch] = useState("");

  const [selectedSiteId, setSelectedSiteId] = useState(null);
  const [siteDetail, setSiteDetail] = useState(null);
  const [siteLogs, setSiteLogs] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const [selectedLogId, setSelectedLogId] = useState(null);
  const [entries, setEntries] = useState([]);
  const [entriesTotal, setEntriesTotal] = useState(0);
  const [entriesCursor, setEntriesCursor] = useState(null);
  const [entriesPageStart, setEntriesPageStart] = useState(0);
  const [entriesLoading, setEntriesLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [units, setUnits] = useState([]);
  const [showUnits, setShowUnits] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    logDate: "",
    co2: "",
    co2Unit: "kg",
    inspectionDate: "",
    notes: "",
    passed: true,
  });

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(null);
    const { res, body } = await mapistryFetch("/sites/stats");
    if (!res.ok) {
      setStatsError(body?.message || "Failed to load stats");
      setStatsLoading(false);
      return;
    }
    setStats(body);
    setStatsLoading(false);
  }, []);

  const loadSites = useCallback(async () => {
    setSitesLoading(true);
    setSitesError(null);
    const { res, body } = await mapistryFetch("/sites?page[size]=100");
    if (!res.ok) {
      setSitesError(body?.message || "Failed to load sites");
      setSitesLoading(false);
      return;
    }
    setSites(body.data || []);
    setSitesLoading(false);
  }, []);

  const loadSiteDetail = useCallback(async (siteId) => {
    setDetailLoading(true);
    setSelectedSiteId(siteId);
    setSelectedLogId(null);
    setEntries([]);
    setShowForm(false);

    const [siteRes, logsRes] = await Promise.all([
      mapistryFetch(`/sites/${siteId}`),
      mapistryFetch(`/edp/sites/${siteId}/logs`),
    ]);

    if (!siteRes.res.ok) {
      addToast(siteRes.body?.message || "Site not found", "error");
      setDetailLoading(false);
      return;
    }
    setSiteDetail(siteRes.body);
    setSiteLogs(logsRes.body?.data || []);
    setDetailLoading(false);
  }, [addToast]);

  const loadEntries = useCallback(
    async (siteId, logId, after = null) => {
      setEntriesLoading(true);
      const params = new URLSearchParams({ "page[size]": String(PAGE_SIZE) });
      if (after) params.set("page[after]", after);
      const { res, body } = await mapistryFetch(
        `/edp/sites/${siteId}/logs/${logId}/entries?${params}`
      );
      if (!res.ok) {
        addToast(body?.message || "Failed to load entries", "error");
        setEntriesLoading(false);
        return;
      }
      setEntries(body.data || []);
      setEntriesTotal(body.meta?.page?.totalCount ?? 0);
      setEntriesCursor(body.meta?.page?.nextCursor ?? null);
      setEntriesLoading(false);
    },
    [addToast]
  );

  const selectLog = useCallback(
    (logId) => {
      setSelectedLogId(logId);
      setEntriesPageStart(0);
      setShowForm(false);
      loadEntries(selectedSiteId, logId, null);
    },
    [selectedSiteId, loadEntries]
  );

  useEffect(() => {
    loadStats();
    loadSites();
  }, [loadStats, loadSites]);

  useEffect(() => {
    if (showUnits) {
      mapistryFetch("/edp/related-units").then(({ body }) => {
        setUnits(body?.data || []);
      });
    }
  }, [showUnits]);

  const filteredSites = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return sites;
    return sites.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.siteCity?.toLowerCase().includes(q) ||
        s.state?.toLowerCase().includes(q)
    );
  }, [sites, search]);

  async function handleSubmitEntry(e) {
    e.preventDefault();
    if (!selectedSiteId || !selectedLogId) return;
    setSubmitting(true);

    const fieldValues = {
      field_1: { value: Number(form.co2), units: form.co2Unit },
      field_2: { value: form.inspectionDate || form.logDate },
      field_3: { value: form.notes },
      field_4: { value: form.passed },
    };

    const { res, body, retryAfter } = await mapistryFetch(
      `/edp/sites/${selectedSiteId}/logs/${selectedLogId}/entries`,
      {
        method: "POST",
        body: JSON.stringify({
          logDate: form.logDate,
          isComplete: true,
          fieldValues,
        }),
      }
    );

    setSubmitting(false);

    if (res.status === 429) {
      addToast(
        `Rate limit exceeded. Retry in ${retryAfter || 60} seconds`,
        "warning"
      );
      return;
    }
    if (!res.ok) {
      addToast(body?.message || "Failed to save entry", "error");
      return;
    }

    addToast("Entry saved successfully", "success");
    setShowForm(false);
    setForm({
      logDate: "",
      co2: "",
      co2Unit: "kg",
      inspectionDate: "",
      notes: "",
      passed: true,
    });
    loadEntries(selectedSiteId, selectedLogId, String(entriesPageStart));
    loadStats();
  }

  function entriesNext() {
    if (!entriesCursor || !selectedSiteId || !selectedLogId) return;
    setEntriesPageStart(parseInt(entriesCursor, 10));
    loadEntries(selectedSiteId, selectedLogId, entriesCursor);
  }

  function entriesPrev() {
    if (!selectedSiteId || !selectedLogId) return;
    const prev = Math.max(0, entriesPageStart - PAGE_SIZE);
    setEntriesPageStart(prev);
    loadEntries(selectedSiteId, selectedLogId, prev === 0 ? null : String(prev));
  }

  const showingEnd = Math.min(entriesPageStart + entries.length, entriesTotal);

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans text-zinc-300 antialiased">
      <MapistryAppNav active={selectedLogId ? "entries" : selectedSiteId ? "logs" : "sites"} />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statsLoading ? (
            <div className="col-span-full">
              <LoadingBlock message="Loading stats..." />
            </div>
          ) : statsError ? (
            <div className="col-span-full">
              <ErrorBlock message={statsError} onRetry={loadStats} />
            </div>
          ) : stats ? (
            <>
              <StatCard label="Total Sites" value={stats.totalSites} />
              <StatCard label="Active Logs" value={stats.activeLogs} />
              <StatCard label="Total Entries" value={stats.totalEntries} />
              <StatCard label="Avg CO₂" value={`${stats.avgCO2} kg`} sub="Across all entries" />
            </>
          ) : null}
        </section>

        <div className="grid gap-6 lg:grid-cols-5">
          <section className="lg:col-span-2">
            <div className="rounded-xl border border-zinc-800 bg-[#111111]">
              <div className="border-b border-zinc-800 p-4">
                <h2 className="text-lg font-semibold text-white">Sites Overview</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  {sites.length} Sites
                </p>
                <input
                  type="search"
                  placeholder="Search by name or city..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="mt-3 w-full rounded-lg border border-zinc-700 bg-[#0a0a0a] px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              {sitesLoading ? (
                <LoadingBlock />
              ) : sitesError ? (
                <div className="p-4">
                  <ErrorBlock message={sitesError} onRetry={loadSites} />
                </div>
              ) : filteredSites.length === 0 ? (
                <EmptyBlock message="No sites match your search" />
              ) : (
                <div className="max-h-[480px] overflow-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 bg-[#111111] text-xs uppercase text-zinc-500">
                      <tr>
                        <th className="px-4 py-2">ID</th>
                        <th className="px-4 py-2">Name</th>
                        <th className="px-4 py-2">City</th>
                        <th className="px-4 py-2">State</th>
                        <th className="px-4 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSites.map((site) => (
                        <tr
                          key={site.id}
                          onClick={() => loadSiteDetail(site.id)}
                          className={`cursor-pointer border-t border-zinc-800 transition-colors hover:bg-emerald-500/5 ${
                            selectedSiteId === site.id ? "bg-emerald-500/10" : ""
                          }`}
                        >
                          <td className="px-4 py-2 font-mono text-xs text-emerald-400">
                            {site.id}
                          </td>
                          <td className="px-4 py-2 text-white">{site.name}</td>
                          <td className="px-4 py-2">{site.siteCity}</td>
                          <td className="px-4 py-2">{site.state}</td>
                          <td className="px-4 py-2">
                            <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-400">
                              Active
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          <section className="lg:col-span-3">
            {!selectedSiteId ? (
              <div className="flex h-full min-h-[320px] items-center justify-center rounded-xl border border-zinc-800 bg-[#111111]">
                <EmptyBlock message="Select a site to view details and logs" />
              </div>
            ) : detailLoading ? (
              <div className="rounded-xl border border-zinc-800 bg-[#111111]">
                <LoadingBlock message="Loading site..." />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-xl border border-zinc-800 bg-[#111111] p-4">
                  <h3 className="text-lg font-semibold text-white">{siteDetail?.name}</h3>
                  <p className="mt-1 text-sm text-zinc-500">
                    {siteDetail?.siteAddress}, {siteDetail?.siteCity}{" "}
                    {siteDetail?.siteZip}
                  </p>
                  <p className="text-sm text-zinc-400">{siteDetail?.state}</p>

                  <h4 className="mt-4 text-sm font-medium text-emerald-400">
                    Compliance Logs
                  </h4>
                  {siteLogs.length === 0 ? (
                    <EmptyBlock message="No logs for this site" />
                  ) : (
                    <ul className="mt-2 space-y-2">
                      {siteLogs.map((log) => (
                        <li key={log.id}>
                          <button
                            type="button"
                            onClick={() => selectLog(log.id)}
                            className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                              selectedLogId === log.id
                                ? "border-emerald-500/50 bg-emerald-500/10"
                                : "border-zinc-800 hover:border-zinc-700"
                            }`}
                          >
                            <span className="font-medium text-white">{log.name}</span>
                            <span className="ml-2 text-xs text-zinc-500">
                              {log.category}
                            </span>
                            <span className="mt-1 block text-xs text-zinc-500">
                              20 entries
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {selectedLogId && (
                  <div className="rounded-xl border border-zinc-800 bg-[#111111]">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 p-4">
                      <div>
                        <h4 className="font-semibold text-white">Log Entries</h4>
                        <p className="text-xs text-zinc-500">
                          Showing {entriesPageStart + 1}–{showingEnd} of {entriesTotal}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowUnits(true)}
                          className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs hover:border-emerald-500/50"
                        >
                          Units
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowForm(!showForm)}
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500"
                        >
                          New Entry
                        </button>
                      </div>
                    </div>

                    {showForm && (
                      <form
                        onSubmit={handleSubmitEntry}
                        className="border-b border-zinc-800 p-4 space-y-3"
                      >
                        <h5 className="text-sm font-medium text-emerald-400">
                          New Entry
                        </h5>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <label className="block text-xs text-zinc-500">
                            Log Date
                            <input
                              type="datetime-local"
                              required
                              value={form.logDate}
                              onChange={(e) =>
                                setForm((f) => ({ ...f, logDate: e.target.value }))
                              }
                              className="mt-1 w-full rounded border border-zinc-700 bg-[#0a0a0a] px-2 py-1.5 text-sm text-white"
                            />
                          </label>
                          <label className="block text-xs text-zinc-500">
                            Inspection Date
                            <input
                              type="date"
                              value={form.inspectionDate}
                              onChange={(e) =>
                                setForm((f) => ({
                                  ...f,
                                  inspectionDate: e.target.value,
                                }))
                              }
                              className="mt-1 w-full rounded border border-zinc-700 bg-[#0a0a0a] px-2 py-1.5 text-sm text-white"
                            />
                          </label>
                          <label className="block text-xs text-zinc-500">
                            CO₂ Emissions
                            <div className="mt-1 flex gap-2">
                              <input
                                type="number"
                                required
                                value={form.co2}
                                onChange={(e) =>
                                  setForm((f) => ({ ...f, co2: e.target.value }))
                                }
                                className="w-full rounded border border-zinc-700 bg-[#0a0a0a] px-2 py-1.5 text-sm text-white"
                              />
                              <select
                                value={form.co2Unit}
                                onChange={(e) =>
                                  setForm((f) => ({ ...f, co2Unit: e.target.value }))
                                }
                                className="rounded border border-zinc-700 bg-[#0a0a0a] px-2 text-sm"
                              >
                                <option value="kg">kg</option>
                                <option value="g">g</option>
                                <option value="lb">lb</option>
                                <option value="ppm">ppm</option>
                              </select>
                            </div>
                          </label>
                        </div>
                        <label className="block text-xs text-zinc-500">
                          Inspector Notes
                          <textarea
                            rows={2}
                            value={form.notes}
                            onChange={(e) =>
                              setForm((f) => ({ ...f, notes: e.target.value }))
                            }
                            className="mt-1 w-full rounded border border-zinc-700 bg-[#0a0a0a] px-2 py-1.5 text-sm text-white"
                          />
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={form.passed}
                            onChange={(e) =>
                              setForm((f) => ({ ...f, passed: e.target.checked }))
                            }
                            className="rounded border-zinc-600"
                          />
                          Passed Inspection
                        </label>
                        <button
                          type="submit"
                          disabled={submitting}
                          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
                        >
                          {submitting ? "Saving..." : "Save Entry"}
                        </button>
                      </form>
                    )}

                    {entriesLoading ? (
                      <LoadingBlock />
                    ) : entries.length === 0 ? (
                      <EmptyBlock message="No entries for this log" />
                    ) : (
                      <>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm">
                            <thead className="text-xs uppercase text-zinc-500">
                              <tr>
                                <th className="px-4 py-2">Date</th>
                                <th className="px-4 py-2">Inspector</th>
                                <th className="px-4 py-2">Status</th>
                                <th className="px-4 py-2">CO₂</th>
                                <th className="px-4 py-2">Passed</th>
                              </tr>
                            </thead>
                            <tbody>
                              {entries.map((entry) => (
                                <tr
                                  key={entry.id}
                                  className="border-t border-zinc-800"
                                >
                                  <td className="px-4 py-2">{entry.logDate}</td>
                                  <td className="px-4 py-2 text-xs">
                                    {entry.createdBy}
                                  </td>
                                  <td className="px-4 py-2">
                                    <span
                                      className={
                                        entry.isComplete
                                          ? "text-emerald-400"
                                          : "text-amber-400"
                                      }
                                    >
                                      {entry.isComplete ? "Complete" : "Draft"}
                                    </span>
                                  </td>
                                  <td className="px-4 py-2">
                                    {entry.fieldValues?.field_1?.value}{" "}
                                    {entry.fieldValues?.field_1?.units}
                                  </td>
                                  <td className="px-4 py-2">
                                    {entry.fieldValues?.field_4?.value
                                      ? "Yes"
                                      : "No"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="flex justify-between border-t border-zinc-800 p-4">
                          <button
                            type="button"
                            onClick={entriesPrev}
                            disabled={entriesPageStart === 0}
                            className="rounded border border-zinc-700 px-3 py-1 text-xs disabled:opacity-40"
                          >
                            Prev
                          </button>
                          <button
                            type="button"
                            onClick={entriesNext}
                            disabled={!entriesCursor}
                            className="rounded border border-zinc-700 px-3 py-1 text-xs disabled:opacity-40"
                          >
                            Next
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      {showUnits && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setShowUnits(false)}
        >
          <div
            className="max-h-[80vh] w-full max-w-md overflow-auto rounded-xl border border-zinc-800 bg-[#111111] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-white">Related Units</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {units.map((u) => (
                <li
                  key={u.id}
                  className="flex justify-between border-b border-zinc-800 py-2"
                >
                  <span className="font-mono text-emerald-400">{u.id}</span>
                  <span>{u.name}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => setShowUnits(false)}
              className="mt-4 w-full rounded-lg border border-zinc-700 py-2 text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
