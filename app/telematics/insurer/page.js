"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { tabsForUser } from "@/lib/statesafe-constants";
import { readTourTab, TOUR_STORAGE } from "@/lib/telematics-tour-steps";
import { useStateSafeData } from "@/lib/statesafe-data";
import { useStateSafe } from "./StateSafeProvider";
import {
  SSNavbar,
  SSWelcomeBar,
  SSConnectionBanner,
  SSFooterLinks,
  SSSpinner,
  SSError,
} from "@/app/components/statesafe-ui";
import DashboardTab from "./tabs/DashboardTab";
import DriversTab from "./tabs/DriversTab";
import RiskTab from "./tabs/RiskTab";
import AnalyticsTab from "./tabs/AnalyticsTab";
import DevToolsTab from "./tabs/DevToolsTab";

export default function StateSafeInsurerPage() {
  const router = useRouter();
  const { user, logout } = useStateSafe();
  const tabs = useMemo(() => (user ? tabsForUser(user.id) : []), [user]);
  const [activeTab, setActiveTab] = useState("dashboard");

  const { loading, refreshing, error, drivers, scoreMap, stats, webhooks, logs, partner, reload } =
    useStateSafeData(!!user);

  useEffect(() => {
    if (!user) {
      router.replace("/telematics/insurer/login");
    }
  }, [user, router]);

  useEffect(() => {
    const tourTab = readTourTab(TOUR_STORAGE.insurerTab);
    if (tourTab) setActiveTab(tourTab);
  }, [user]);

  useEffect(() => {
    if (tabs.length && !tabs.some((t) => t.id === activeTab)) {
      setActiveTab(tabs[0].id);
    }
  }, [tabs, activeTab]);

  function handleSwitchUser() {
    logout();
    router.push("/telematics/insurer/login");
  }

  if (!user) {
    return <SSSpinner label="Redirecting to login…" />;
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <SSNavbar
        user={user}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSwitchUser={handleSwitchUser}
      />
      <SSWelcomeBar user={user} />
      <SSConnectionBanner />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {loading && <SSSpinner label="Loading portal data…" />}
        {!loading && error && <SSError message={error} onRetry={reload} />}
        {!loading && !error && (
          <>
            {refreshing && (
              <p className="mb-4 text-sm text-[#6B7280]">Updating portal data…</p>
            )}
            {activeTab === "dashboard" && (
              <DashboardTab stats={stats} webhooks={webhooks} />
            )}
            {activeTab === "drivers" && (
              <DriversTab drivers={drivers} scoreMap={scoreMap} />
            )}
            {activeTab === "risk" && <RiskTab onReload={reload} />}
            {activeTab === "analytics" && (
              <AnalyticsTab stats={stats} drivers={drivers} scoreMap={scoreMap} />
            )}
            {activeTab === "devtools" && (
              <DevToolsTab logs={logs} webhooks={webhooks} partner={partner} />
            )}
          </>
        )}
      </main>

      <SSFooterLinks />
    </div>
  );
}
