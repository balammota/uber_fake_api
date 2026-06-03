"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import TelematicsNav from "@/components/TelematicsNav";
import { createSupabaseBrowser } from "@/lib/supabase";
import {
  consentBadgeClass,
  formatTime,
  formatUsd,
  gradeBadgeClass,
  latestScoresByDriver,
  partnerStatusClass,
  statusCodeClass,
} from "@/lib/telematics-utils";
import {
  Badge,
  ErrorState,
  LoadingState,
  PrimaryButton,
  TelematicsCard,
  TelematicsStatCard,
  TelematicsTable,
  Toast,
} from "@/app/components/telematics-ui";

export default function UberTelematicsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [partners, setPartners] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [scores, setScores] = useState([]);
  const [logs, setLogs] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createSupabaseBrowser();
      const [pRes, dRes, sRes, lRes] = await Promise.all([
        supabase.from("telematics_partners").select("*").order("partner_name"),
        supabase.from("telematics_drivers").select("*").order("driver_id"),
        supabase.from("telematics_scores").select("*").order("recorded_at", { ascending: false }),
        supabase
          .from("telematics_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(20),
      ]);

      if (pRes.error) throw pRes.error;
      if (dRes.error) throw dRes.error;
      if (sRes.error) throw sRes.error;
      if (lRes.error) throw lRes.error;

      setPartners(pRes.data || []);
      setDrivers(dRes.data || []);
      setScores(sRes.data || []);
      setLogs(lRes.data || []);
    } catch (err) {
      setError(err?.message || "Failed to load telematics data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const scoreMap = useMemo(() => latestScoresByDriver(scores), [scores]);

  const stats = useMemo(() => {
    const activeDrivers = drivers.filter((d) => d.consent_status === "active").length;
    const apiToday = partners.reduce((a, p) => a + (p.api_calls_today || 0), 0);
    const revenue = partners.reduce((a, p) => a + Number(p.revenue_usd || 0), 0);
    return {
      partners: partners.length,
      activeDrivers,
      apiToday,
      revenue: formatUsd(revenue),
    };
  }, [partners, drivers]);

  const partnerRows = useMemo(
    () =>
      partners.map((p) => ({
        key: p.partner_id,
        cells: [
          p.partner_name,
          <Badge key="s" className={partnerStatusClass(p.status)}>
            {p.status}
          </Badge>,
          p.drivers_connected,
          p.api_calls_today?.toLocaleString(),
          p.api_calls_total?.toLocaleString(),
          formatUsd(Number(p.revenue_usd)),
        ],
      })),
    [partners]
  );

  const driverRows = useMemo(
    () =>
      drivers.map((d) => {
        const sc = scoreMap.get(d.driver_id);
        return {
          key: d.driver_id,
          cells: [
            d.driver_id,
            d.driver_name,
            d.city,
            <Badge key="c" className={consentBadgeClass(d.consent_status)}>
              {d.consent_status}
            </Badge>,
            sc?.score ?? "—",
            sc?.grade ? (
              <Badge key="g" className={gradeBadgeClass(sc.grade)}>
                {sc.grade}
              </Badge>
            ) : (
              "—"
            ),
            sc?.recorded_at ? formatTime(sc.recorded_at) : "—",
          ],
        };
      }),
    [drivers, scoreMap]
  );

  const logRows = useMemo(
    () =>
      logs.map((l) => ({
        key: l.id,
        cells: [
          formatTime(l.created_at || l.timestamp_ms),
          l.partner_id,
          l.driver_id || "—",
          <span key="e" className="font-mono text-xs">
            {l.endpoint}
          </span>,
          <span key="st" className={statusCodeClass(l.status_code)}>
            {l.status_code}
          </span>,
          `${l.response_time_ms} ms`,
        ],
      })),
    [logs]
  );

  async function handleGenerate() {
    setGenerating(true);
    try {
      const res = await fetch("/api/telematics/generate-scores", { method: "POST" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Generate failed");
      setToast(`Score data updated for ${body.updated} drivers`);
      await loadData();
    } catch (err) {
      setToast(err?.message || "Failed to generate scores");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <>
      <TelematicsNav title="Uber Telematics" />
      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Uber Telematics — Partner Management
          </h1>
          <PrimaryButton onClick={handleGenerate} disabled={generating || loading}>
            {generating ? "Generating…" : "Generate New Score Data"}
          </PrimaryButton>
        </div>

        {loading && <LoadingState />}
        {!loading && error && <ErrorState message={error} onRetry={loadData} />}

        {!loading && !error && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <TelematicsStatCard label="Total Partners" value={stats.partners} />
              <TelematicsStatCard label="Active Drivers" value={stats.activeDrivers} />
              <TelematicsStatCard label="API Calls Today" value={stats.apiToday.toLocaleString()} />
              <TelematicsStatCard label="Total Revenue" value={stats.revenue} />
            </div>

            <TelematicsCard title="Insurance Partners">
              <TelematicsTable
                columns={[
                  "Partner",
                  "Status",
                  "Drivers Connected",
                  "API Calls Today",
                  "Total Calls",
                  "Revenue",
                ]}
                rows={partnerRows}
                emptyMessage="No partners configured"
              />
            </TelematicsCard>

            <TelematicsCard title="Driver Consent Overview">
              <TelematicsTable
                columns={[
                  "Driver ID",
                  "Name",
                  "City",
                  "Consent Status",
                  "Score",
                  "Grade",
                  "Last Updated",
                ]}
                rows={driverRows}
                emptyMessage="No drivers"
              />
            </TelematicsCard>

            <TelematicsCard title="API Request Logs">
              <TelematicsTable
                columns={["Time", "Partner", "Driver", "Endpoint", "Status", "Response Time"]}
                rows={logRows}
                emptyMessage="No logs yet — make API calls from the Insurer Portal"
              />
            </TelematicsCard>
          </>
        )}
      </main>
      <Toast message={toast} onClose={() => setToast("")} />
    </>
  );
}
