"use client";

import { useMemo } from "react";
import {
  portfolioGradeBuckets,
  avgScoreColorClass,
  discountBadge,
} from "@/lib/statesafe-utils";
import { SSStatCard, SSCard, HorizontalGradeChart, SSTable } from "@/app/components/statesafe-ui";
import { formatUsd } from "@/lib/telematics-utils";

function avgDiscountLabel(scores) {
  if (!scores.length) return "—";
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  return discountBadge(Math.round(avg)).label;
}

export default function AnalyticsTab({ stats, drivers, scoreMap }) {
  const buckets = portfolioGradeBuckets(stats.scores);

  const cityRows = useMemo(() => {
    const byCity = {};
    for (const d of drivers) {
      const sc = scoreMap.get(d.driver_id)?.score ?? 0;
      if (!byCity[d.city]) byCity[d.city] = { drivers: 0, scores: [], highRisk: 0, eligible: 0 };
      byCity[d.city].drivers += 1;
      byCity[d.city].scores.push(sc);
      if (sc < 60) byCity[d.city].highRisk += 1;
      if (sc >= 70) byCity[d.city].eligible += 1;
    }
    return Object.entries(byCity)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([city, data]) => ({
        city,
        drivers: data.drivers,
        avg: data.scores.length
          ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length)
          : 0,
        highRisk: data.highRisk,
        eligible: data.eligible,
      }));
  }, [drivers, scoreMap]);

  const gradeRows = useMemo(() => {
    const grades = ["A+", "A", "B", "C", "D"];
    const byGrade = {};
    for (const g of grades) byGrade[g] = { scores: [] };
    for (const d of drivers) {
      const entry = scoreMap.get(d.driver_id);
      if (!entry) continue;
      const bucket =
        entry.score >= 90
          ? "A+"
          : entry.score >= 80
            ? "A"
            : entry.score >= 70
              ? "B"
              : entry.score >= 60
                ? "C"
                : "D";
      byGrade[bucket].scores.push(entry.score);
    }
    const total = drivers.length || 1;
    return grades.map((g) => {
      const scores = byGrade[g].scores;
      const count = scores.length;
      const avg = count ? Math.round(scores.reduce((a, b) => a + b, 0) / count) : 0;
      const savings = count ? Math.max(0, (avg - 50) * 120 * count) : 0;
      return {
        grade: g,
        count,
        pct: Math.round((count / total) * 100),
        avgDiscount: avgDiscountLabel(scores),
        savings: formatUsd(savings),
      };
    });
  }, [drivers, scoreMap]);

  const segments = useMemo(() => {
    const low = [];
    const mod = [];
    const high = [];
    for (const d of drivers) {
      const sc = scoreMap.get(d.driver_id)?.score ?? 0;
      if (sc >= 80) low.push(sc);
      else if (sc >= 60) mod.push(sc);
      else high.push(sc);
    }
    const avg = (arr) => (arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0);
    return {
      low: { count: low.length, avg: avg(low), note: avgDiscountLabel(low) },
      mod: { count: mod.length, avg: avg(mod), note: "Standard rate" },
      high: { count: high.length, avg: avg(high), note: "+10% surcharge recommended" },
    };
  }, [drivers, scoreMap]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-[#1A1A1A]">Portfolio Analytics</h2>
        <p className="mt-2 text-[#6B7280]">Detailed metrics across your telematics portfolio</p>
      </div>

      <section>
        <h3 className="mb-4 text-lg font-semibold">Portfolio Summary</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SSStatCard
            icon="👥"
            label="Active Drivers"
            value={stats.activeDrivers}
            subtitle={`${stats.activeDrivers} drivers with active consent enrolled in program`}
          />
          <SSStatCard
            icon="📊"
            label="Avg Portfolio Score"
            value={stats.avgScore || "—"}
            subtitle="Rolling 90-day average across all active drivers"
            valueClassName={avgScoreColorClass(stats.avgScore)}
          />
          <SSStatCard
            icon="📉"
            label="Est. Premium Savings"
            value={stats.premiumSavings}
            subtitle="Projected annual savings vs standard pricing baseline"
          />
          <SSStatCard
            icon="✓"
            label="Eligible for Discount"
            value={stats.eligibleDiscount}
            subtitle={`${stats.eligibleDiscount} of ${stats.activeDrivers} drivers score 70+`}
          />
        </div>
      </section>

      <SSCard title="Score Distribution">
        <HorizontalGradeChart buckets={buckets} />
        <div className="mt-6 grid gap-2 sm:grid-cols-5">
          {buckets.map((b) => (
            <div key={b.label} className="rounded border border-[#E5E7EB] p-3 text-center text-sm">
              <p className="font-semibold text-[#1A1A1A]">{b.count}</p>
              <p className="text-xs text-[#6B7280]">{b.label.split(" ")[0]}</p>
            </div>
          ))}
        </div>
      </SSCard>

      <SSCard title="City Breakdown">
        <SSTable
          columns={["City", "Drivers", "Avg Score", "High Risk", "Eligible for Discount"]}
          rows={cityRows.map((r) => ({
            key: r.city,
            cells: [r.city, r.drivers, r.avg, r.highRisk, r.eligible],
          }))}
          emptyMessage="No city data available"
        />
      </SSCard>

      <SSCard title="Grade Distribution">
        <SSTable
          columns={["Grade", "Count", "% of Portfolio", "Avg Discount", "Est. Savings"]}
          rows={gradeRows.map((r) => ({
            key: r.grade,
            cells: [r.grade, r.count, `${r.pct}%`, r.avgDiscount, r.savings],
          }))}
          emptyMessage="No grade data available"
        />
      </SSCard>

      <section>
        <h3 className="mb-4 text-lg font-semibold">Risk Segments</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-lg border border-emerald-200 bg-emerald-50 p-5">
            <h4 className="font-bold text-emerald-900">Low Risk (80+)</h4>
            <p className="mt-3 text-3xl font-bold text-emerald-700">{segments.low.count}</p>
            <p className="mt-2 text-sm text-emerald-800">Avg score: {segments.low.avg || "—"}</p>
            <p className="mt-1 text-sm text-emerald-800">{segments.low.note}</p>
          </article>
          <article className="rounded-lg border border-amber-200 bg-amber-50 p-5">
            <h4 className="font-bold text-amber-900">Moderate Risk (60–79)</h4>
            <p className="mt-3 text-3xl font-bold text-amber-700">{segments.mod.count}</p>
            <p className="mt-2 text-sm text-amber-800">Avg score: {segments.mod.avg || "—"}</p>
            <p className="mt-1 text-sm text-amber-800">{segments.mod.note}</p>
          </article>
          <article className="rounded-lg border border-red-200 bg-[#FFF0F2] p-5">
            <h4 className="font-bold text-[#9B0B22]">High Risk (0–59)</h4>
            <p className="mt-3 text-3xl font-bold text-[#C8102E]">{segments.high.count}</p>
            <p className="mt-2 text-sm text-[#9B0B22]">Avg score: {segments.high.avg || "—"}</p>
            <p className="mt-1 text-sm text-[#9B0B22]">{segments.high.note}</p>
          </article>
        </div>
      </section>
    </div>
  );
}
