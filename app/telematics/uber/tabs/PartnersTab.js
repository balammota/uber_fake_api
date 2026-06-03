"use client";

import { useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase";
import { formatUsd } from "@/lib/telematics-utils";
import { partnerDisplayName, PENDING_APPLICATIONS } from "@/lib/uber-portal-constants";
import { errorRateClass, partnerErrorRateToday, partnerStatusBadge } from "@/lib/uber-portal-utils";
import {
  UberSecondaryButton,
  UberDangerButton,
} from "@/app/components/uber-portal-ui";
import {
  Badge,
  TelematicsCard,
  TelematicsTable,
} from "@/app/components/telematics-ui";

export default function PartnersTab({
  partners,
  logs,
  onDebugPartner,
  onImpersonate,
  onReload,
  onToast,
}) {
  const [pending, setPending] = useState(PENDING_APPLICATIONS);
  const [rejectModal, setRejectModal] = useState(null);
  const [processing, setProcessing] = useState(null);

  async function approveApplication(app) {
    setProcessing(app.id);
    try {
      const supabase = createSupabaseBrowser();
      const { error } = await supabase.from("telematics_partners").upsert(
        {
          partner_id: app.partnerId,
          partner_name: app.company,
          status: "active",
          api_calls_total: 0,
          api_calls_today: 0,
          drivers_connected: 0,
          revenue_usd: 0,
        },
        { onConflict: "partner_id" }
      );
      if (error) throw error;
      setPending((prev) => prev.filter((p) => p.id !== app.id));
      onToast(`Partner approved — welcome email sent to ${app.company}`);
      await onReload();
    } catch (err) {
      onToast(err?.message || "Failed to approve partner");
    } finally {
      setProcessing(null);
    }
  }

  async function rejectApplication(app) {
    setProcessing(app.id);
    try {
      const supabase = createSupabaseBrowser();
      await supabase.from("telematics_partners").upsert(
        { partner_id: app.partnerId, partner_name: app.company, status: "rejected" },
        { onConflict: "partner_id" }
      );
      setPending((prev) => prev.filter((p) => p.id !== app.id));
      setRejectModal(null);
      onToast("Partner rejected");
      await onReload();
    } catch (err) {
      onToast(err?.message || "Failed to reject partner");
    } finally {
      setProcessing(null);
    }
  }

  const partnerRows = partners.map((p) => {
    const errRate = partnerErrorRateToday(logs, p.partner_id);
    return {
      key: p.partner_id,
      cells: [
        partnerDisplayName(p.partner_id, p.partner_name),
        <Badge key="s" className={partnerStatusBadge(p.status)}>
          {p.status}
        </Badge>,
        p.drivers_connected,
        (p.api_calls_today || 0).toLocaleString(),
        <span key="e" className={`font-medium ${errorRateClass(errRate)}`}>
          {errRate.toFixed(1)}%
        </span>,
        "142ms",
        formatUsd(Number(p.revenue_usd)),
        <span key="a" className="flex flex-wrap gap-2">
          <UberSecondaryButton onClick={() => onDebugPartner(p.partner_id)}>Debug</UberSecondaryButton>
          <UberSecondaryButton onClick={() => onImpersonate(p.partner_id)}>Impersonate</UberSecondaryButton>
        </span>,
      ],
    };
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Insurance Partners</h2>
        <p className="mt-2 text-zinc-500">Monitor partner integrations and onboarding</p>
      </div>

      <TelematicsCard title="Partner Status">
        <TelematicsTable
          columns={[
            "Partner",
            "Status",
            "Drivers",
            "Calls Today",
            "Error Rate",
            "Latency",
            "Revenue",
            "Actions",
          ]}
          rows={partnerRows}
          emptyMessage="No partners configured"
        />
      </TelematicsCard>

      <TelematicsCard title="Pending Partner Applications">
        {pending.length === 0 ? (
          <p className="text-sm text-zinc-500">No pending applications</p>
        ) : (
          <ul className="space-y-4">
            {pending.map((app) => (
              <li
                key={app.id}
                className="rounded-lg border border-[#222222] bg-[#0a0a0a] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-white">{app.company}</p>
                    <p className="mt-1 text-sm text-zinc-500">
                      Applied: {app.appliedDaysAgo} day{app.appliedDaysAgo !== 1 ? "s" : ""} ago
                    </p>
                    <p className="mt-2 text-sm text-zinc-400">Use case: {app.useCase}</p>
                    <Badge className="mt-2 bg-amber-500/20 text-amber-400">{app.status}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <UberSecondaryButton
                      onClick={() => approveApplication(app)}
                      disabled={processing === app.id}
                    >
                      Approve
                    </UberSecondaryButton>
                    <UberDangerButton
                      onClick={() => setRejectModal(app)}
                      disabled={processing === app.id}
                    >
                      Reject
                    </UberDangerButton>
                    {app.status !== "Info Requested" && (
                      <UberSecondaryButton onClick={() => onToast(`Info request sent to ${app.company}`)}>
                        Request Info
                      </UberSecondaryButton>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </TelematicsCard>

      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            onClick={() => setRejectModal(null)}
            aria-label="Close"
          />
          <div className="relative w-full max-w-md rounded-xl border border-[#222222] bg-[#111111] p-6">
            <h3 className="text-lg font-bold text-white">Reject partner?</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Reject application from {rejectModal.company}? This action cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <UberDangerButton onClick={() => rejectApplication(rejectModal)}>Confirm Reject</UberDangerButton>
              <UberSecondaryButton onClick={() => setRejectModal(null)}>Cancel</UberSecondaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
