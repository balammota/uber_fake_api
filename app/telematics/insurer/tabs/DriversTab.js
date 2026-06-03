"use client";

import { useMemo, useState } from "react";
import {
  discountBadge,
  gradeBadgeStyles,
  gradeMatchesFilter,
  riskLevel,
  scoreColorClass,
} from "@/lib/statesafe-utils";
import {
  SSModal,
  SSSpinner,
  SSTable,
  SSBadge,
  SSScoreBar,
  SSInput,
  SSSelect,
  apiAuthHeaders,
} from "@/app/components/statesafe-ui";
import { modalRecommendation } from "@/lib/statesafe-utils";

export default function DriversTab({ drivers, scoreMap }) {
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [sort, setSort] = useState("score-desc");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [profile, setProfile] = useState(null);

  const cities = useMemo(
    () => [...new Set(drivers.map((d) => d.city))].sort(),
    [drivers]
  );

  const filtered = useMemo(() => {
    let rows = drivers.filter((d) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q || d.driver_id.toLowerCase().includes(q) || d.city.toLowerCase().includes(q);
      const sc = scoreMap.get(d.driver_id);
      const matchGrade = gradeMatchesFilter(sc?.grade, gradeFilter);
      const matchCity = cityFilter === "all" || d.city === cityFilter;
      return matchSearch && matchGrade && matchCity;
    });

    rows.sort((a, b) => {
      const sa = scoreMap.get(a.driver_id)?.score ?? 0;
      const sb = scoreMap.get(b.driver_id)?.score ?? 0;
      if (sort === "score-desc") return sb - sa;
      if (sort === "score-asc") return sa - sb;
      return a.driver_id.localeCompare(b.driver_id);
    });
    return rows;
  }, [drivers, search, gradeFilter, cityFilter, sort, scoreMap]);

  async function openProfile(driverId) {
    setModalOpen(true);
    setModalLoading(true);
    setModalError(null);
    setProfile(null);
    try {
      const res = await fetch(`/api/telematics/drivers/${driverId}/summary`, {
        headers: apiAuthHeaders(),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || "Failed to load profile");
      setProfile(body);
    } catch (err) {
      setModalError(err?.message || "Failed to load profile");
    } finally {
      setModalLoading(false);
    }
  }

  const tableRows = filtered.map((d) => {
    const sc = scoreMap.get(d.driver_id);
    const score = sc?.score ?? 0;
    const disc = discountBadge(score);
    const risk = riskLevel(score);
    return {
      key: d.driver_id,
      cells: [
        <span key="id" className="font-mono text-sm">
          {d.driver_id}
        </span>,
        d.city,
        <span key="score" className={`font-bold ${scoreColorClass(score)}`}>
          {score}
        </span>,
        sc?.grade ? (
          <SSBadge key="g" className={gradeBadgeStyles(sc.grade)}>
            {sc.grade}
          </SSBadge>
        ) : (
          "—"
        ),
        <SSBadge key="d" className={disc.className}>
          {disc.label}
        </SSBadge>,
        <span key="r" className={`font-medium ${risk.className}`}>
          {risk.label}
        </span>,
        <button
          key="a"
          type="button"
          onClick={() => openProfile(d.driver_id)}
          className="rounded border border-[#C8102E] px-3 py-1 text-xs font-semibold text-[#C8102E] hover:bg-[#FFF0F2]"
        >
          View Profile
        </button>,
      ],
    };
  });

  const rec = profile ? modalRecommendation(profile.score) : null;

  return (
    <>
      <div className="mb-6 flex flex-wrap gap-3">
        <SSInput
          placeholder="Search driver ID or city…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-[200px] flex-1"
        />
        <SSSelect value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)}>
          <option value="all">All grades</option>
          <option value="A+">A+</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
        </SSSelect>
        <SSSelect value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}>
          <option value="all">All cities</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </SSSelect>
        <SSSelect value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="score-desc">Score (high-low)</option>
          <option value="score-asc">Score (low-high)</option>
          <option value="id">Driver ID</option>
        </SSSelect>
      </div>

      <SSTable
        columns={["Driver ID", "City", "Score", "Grade", "Discount", "Risk Level", "Action"]}
        rows={tableRows}
        emptyMessage="No drivers match your filters"
      />

      <SSModal open={modalOpen} onClose={() => setModalOpen(false)} title="Driver Profile">
        {modalLoading && <SSSpinner label="Loading driver profile…" />}
        {modalError && <p className="text-[#C8102E]">{modalError}</p>}
        {profile && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-lg font-bold">{profile.driver_id}</span>
              <SSBadge
                className={
                  profile.consent_status === "active"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-red-100 text-[#9B0B22]"
                }
              >
                {profile.consent_status}
              </SSBadge>
            </div>
            <div className="flex flex-wrap gap-8">
              <div>
                <p className="text-sm text-[#6B7280]">Score</p>
                <p className={`text-4xl font-bold ${scoreColorClass(profile.score)}`}>
                  {profile.score}
                </p>
                <SSBadge className={`mt-2 ${gradeBadgeStyles(profile.grade)}`}>
                  {profile.grade}
                </SSBadge>
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Percentile</p>
                <p className="text-lg font-semibold">
                  Better than {profile.percentile}% of Uber drivers
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <p className="font-semibold">Score breakdown</p>
              {profile.score_breakdown &&
                Object.entries(profile.score_breakdown).map(([key, val]) => (
                  <SSScoreBar
                    key={key}
                    label={key.replace(/_/g, " ")}
                    value={val}
                  />
                ))}
            </div>
            {profile.events && (
              <div>
                <p className="mb-2 font-semibold">Events</p>
                <ul className="space-y-1 text-sm text-[#333333]">
                  <li>Harsh braking: {profile.events.harsh_braking?.count ?? 0} events</li>
                  <li>Speeding: {profile.events.speeding?.count ?? 0} events</li>
                  <li>Phone usage: {profile.events.phone_usage?.count ?? 0} events</li>
                </ul>
              </div>
            )}
            {rec && (
              <div className={`rounded-lg border p-4 text-sm font-medium ${rec.className}`}>
                {rec.label}
              </div>
            )}
          </div>
        )}
      </SSModal>
    </>
  );
}
