"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { uberTabsForUser } from "@/lib/uber-portal-constants";
import { useUberPortalData } from "@/lib/uber-portal-data";
import { useUberPortal } from "./UberPortalProvider";
import {
  UberNavbar,
  UberStatusBar,
  UberFooterLinks,
  UberSpinner,
} from "@/app/components/uber-portal-ui";
import { ErrorState, LoadingState, Toast } from "@/app/components/telematics-ui";
import OverviewTab from "./tabs/OverviewTab";
import PartnersTab from "./tabs/PartnersTab";
import DriverConsentTab from "./tabs/DriverConsentTab";
import PartnerDebugTab from "./tabs/PartnerDebugTab";
import SystemHealthTab from "./tabs/SystemHealthTab";
import ApiLogsTab from "./tabs/ApiLogsTab";
import AlertsTab from "./tabs/AlertsTab";
import RevenueTab from "./tabs/RevenueTab";
import PartnerPipelineTab from "./tabs/PartnerPipelineTab";
import MarketAnalyticsTab from "./tabs/MarketAnalyticsTab";

export default function UberTelematicsPage() {
  const router = useRouter();
  const { user, logout } = useUberPortal();
  const tabs = useMemo(() => (user ? uberTabsForUser(user.id) : []), [user]);
  const [activeTab, setActiveTab] = useState("overview");
  const [debugPartnerId, setDebugPartnerId] = useState(null);
  const [acknowledged, setAcknowledged] = useState(new Set());
  const [toast, setToast] = useState("");

  const showToast = useCallback((msg) => setToast(msg), []);

  const {
    loading,
    error,
    partners,
    drivers,
    logs,
    webhooks,
    scoreMap,
    alerts,
    systemMetrics,
    lastUpdated,
    reload,
  } = useUberPortalData(!!user, acknowledged);

  useEffect(() => {
    if (!user) router.replace("/telematics/uber/login");
  }, [user, router]);

  useEffect(() => {
    if (tabs.length && !tabs.some((t) => t.id === activeTab)) {
      setActiveTab(tabs[0].id);
    }
  }, [tabs, activeTab]);

  function handleSwitchUser() {
    logout();
    router.push("/telematics/uber/login");
  }

  function handleDebugPartner(partnerId) {
    setDebugPartnerId(partnerId);
    setActiveTab("debug");
    showToast("Partner debug view opened");
  }

  function handleImpersonate(partnerId) {
    setDebugPartnerId(partnerId);
    setActiveTab("debug");
    showToast("Impersonating partner view");
  }

  function handleAcknowledge(id) {
    setAcknowledged((prev) => new Set([...prev, id]));
    showToast("Alert acknowledged");
  }

  function handleDismiss(id) {
    setAcknowledged((prev) => new Set([...prev, id]));
    showToast("Alert dismissed");
  }

  function handleNotify(alert) {
    showToast(`Notification sent to ${alert.partner}`);
  }

  function handleInvestigate() {
    setActiveTab("logs");
  }

  if (!user) return <UberSpinner label="Redirecting to login…" />;

  return (
    <>
      <UberNavbar
        user={user}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSwitchUser={handleSwitchUser}
      />
      <UberStatusBar
        degraded={systemMetrics.degraded}
        latency={systemMetrics.latency}
        lastUpdated={lastUpdated}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {loading && <LoadingState message="Loading portal data…" />}
        {!loading && error && <ErrorState message={error} onRetry={reload} />}

        {!loading && !error && (
          <>
            {activeTab === "overview" && (
              <OverviewTab
                user={user}
                partners={partners}
                drivers={drivers}
                logs={logs}
                alerts={alerts}
                systemMetrics={systemMetrics}
              />
            )}
            {activeTab === "partners" && (
              <PartnersTab
                partners={partners}
                logs={logs}
                onDebugPartner={handleDebugPartner}
                onImpersonate={handleImpersonate}
                onReload={reload}
                onToast={showToast}
              />
            )}
            {activeTab === "consent" && (
              <DriverConsentTab drivers={drivers} scoreMap={scoreMap} />
            )}
            {activeTab === "debug" && (
              <PartnerDebugTab
                partners={partners}
                logs={logs}
                webhooks={webhooks}
                drivers={drivers}
                scoreMap={scoreMap}
                selectedPartnerId={debugPartnerId}
                onSelectPartner={setDebugPartnerId}
                onToast={showToast}
              />
            )}
            {activeTab === "health" && (
              <SystemHealthTab logs={logs} systemMetrics={systemMetrics} />
            )}
            {activeTab === "logs" && <ApiLogsTab logs={logs} onToast={showToast} />}
            {activeTab === "alerts" && (
              <AlertsTab
                alerts={alerts}
                user={user}
                acknowledged={acknowledged}
                onAcknowledge={handleAcknowledge}
                onInvestigate={handleInvestigate}
                onNotify={handleNotify}
                onDismiss={handleDismiss}
                onToast={showToast}
              />
            )}
            {activeTab === "revenue" && <RevenueTab partners={partners} />}
            {activeTab === "pipeline" && <PartnerPipelineTab partners={partners} />}
            {activeTab === "market" && <MarketAnalyticsTab />}
          </>
        )}
      </main>

      <UberFooterLinks />
      <Toast message={toast} onClose={() => setToast("")} />
    </>
  );
}
