"use client";

import { useMemo } from "react";
import { formatTime } from "@/lib/telematics-utils";
import { ALERT_RULES } from "@/lib/uber-portal-constants";
import {
  SeverityBadge,
  UberSecondaryButton,
  UberDangerButton,
} from "@/app/components/uber-portal-ui";
import { Badge, TelematicsCard, TelematicsTable } from "@/app/components/telematics-ui";

export default function AlertsTab({
  alerts,
  user,
  acknowledged,
  onAcknowledge,
  onInvestigate,
  onNotify,
  onDismiss,
  onToast,
}) {
  const active = useMemo(() => alerts.filter((a) => a.status === "Active"), [alerts]);
  const history = useMemo(() => alerts.slice(0, 20), [alerts]);

  const ruleRows = ALERT_RULES.map((r) => ({
    key: r.rule,
    cells: [r.rule, r.threshold, r.severity, r.notify],
  }));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Alert Center</h2>
        <p className="mt-2 text-zinc-500">
          Proactive monitoring — never wait for a partner to tell you something is wrong
        </p>
      </div>

      <TelematicsCard title={`Active Alerts (${active.length})`}>
        {active.length === 0 ? (
          <p className="text-sm text-zinc-500">No active alerts</p>
        ) : (
          <ul className="space-y-4">
            {active.map((a) => (
              <li
                key={a.id}
                className={`rounded-lg border border-[#222222] border-l-4 bg-[#0a0a0a] p-4 ${
                  a.severity === "CRITICAL"
                    ? "border-l-red-500"
                    : a.severity === "WARNING"
                      ? "border-l-amber-500"
                      : "border-l-zinc-500"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <SeverityBadge severity={a.severity} />
                      <span className="text-sm font-medium text-white">{a.partner}</span>
                    </div>
                    <p className="mt-2 text-sm text-zinc-300">{a.description}</p>
                    <p className="mt-2 text-xs text-zinc-500">{formatTime(a.timestamp)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {a.severity === "CRITICAL" && (
                      <>
                        <UberSecondaryButton
                          onClick={() => {
                            onInvestigate(a);
                            onToast(`Investigation opened for ${a.partner}`);
                          }}
                        >
                          Investigate
                        </UberSecondaryButton>
                        <UberSecondaryButton onClick={() => onAcknowledge(a.id)}>
                          Acknowledge
                        </UberSecondaryButton>
                        <UberSecondaryButton onClick={() => onNotify(a)}>
                          Notify Partner
                        </UberSecondaryButton>
                      </>
                    )}
                    {a.severity === "WARNING" && (
                      <>
                        <UberSecondaryButton onClick={() => onNotify(a)}>
                          Notify Partner
                        </UberSecondaryButton>
                        <UberDangerButton onClick={() => onDismiss(a.id)}>Dismiss</UberDangerButton>
                      </>
                    )}
                    {a.severity === "INFO" && (
                      <UberSecondaryButton onClick={() => onAcknowledge(a.id)}>
                        Acknowledge
                      </UberSecondaryButton>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </TelematicsCard>

      <TelematicsCard title="Alert History">
        {history.length === 0 ? (
          <p className="text-sm text-zinc-500">No alert history</p>
        ) : (
          <ul className="space-y-3">
            {history.map((a) => (
              <li
                key={`hist-${a.id}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded border border-zinc-800 px-4 py-3"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <SeverityBadge severity={a.severity} />
                  <span className="text-sm text-white">{a.partner}</span>
                  <span className="text-sm text-zinc-500">{a.description.slice(0, 60)}…</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-500">
                  <span>{formatTime(a.timestamp)}</span>
                  <Badge
                    className={
                      a.status === "Active"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-zinc-700 text-zinc-300"
                    }
                  >
                    {a.status}
                  </Badge>
                  {a.status === "Acknowledged" && (
                    <span>Ack by {user.name.split(" ")[0]}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </TelematicsCard>

      <TelematicsCard title="Alert Rules">
        <TelematicsTable
          columns={["Rule", "Threshold", "Severity", "Auto-notify Partner"]}
          rows={ruleRows}
        />
      </TelematicsCard>
    </div>
  );
}
