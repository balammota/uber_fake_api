"use client";

import { formatTime } from "@/lib/telematics-utils";
import { portfolioGradeBuckets, avgScoreColorClass, formatWebhookActivity } from "@/lib/statesafe-utils";
import { SSStatCard, SSCard, HorizontalGradeChart } from "@/app/components/statesafe-ui";

export default function DashboardTab({ stats, webhooks }) {
  const buckets = portfolioGradeBuckets(stats.scores);
  const recent = webhooks.slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SSStatCard icon="👥" label="Active Drivers" value={stats.activeDrivers} subtitle="With active consent" />
        <SSStatCard
          icon="📊"
          label="Avg Portfolio Score"
          value={stats.avgScore || "—"}
          subtitle="Last 90 days"
          valueClassName={avgScoreColorClass(stats.avgScore)}
        />
        <SSStatCard
          icon="📉"
          label="Est. Premium Savings"
          value={stats.premiumSavings}
          subtitle="vs standard pricing"
        />
        <SSStatCard
          icon="✓"
          label="Drivers Eligible for Discount"
          value={stats.eligibleDiscount}
          subtitle="Score 70 or above"
        />
      </div>

      <SSCard title="Portfolio Risk Distribution">
        <HorizontalGradeChart buckets={buckets} />
      </SSCard>

      <SSCard title="Recent Activity">
        {recent.length === 0 ? (
          <p className="text-sm text-[#6B7280]">No recent activity</p>
        ) : (
          <ul className="space-y-3">
            {recent.map((w) => {
              const { improved, text } = formatWebhookActivity(w);
              return (
                <li
                  key={w.id}
                  className="flex items-start gap-3 rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm"
                >
                  <span className={improved ? "text-emerald-600" : "text-[#C8102E]"} aria-hidden>
                    {improved ? "↑" : "↓"}
                  </span>
                  <span>
                    <span className="text-[#1A1A1A]">{text}</span>
                    <span className="mt-1 block text-xs text-[#6B7280]">{formatTime(w.created_at)}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </SSCard>
    </div>
  );
}
