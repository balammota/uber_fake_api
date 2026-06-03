"use client";

import Link from "next/link";
import { formatTime } from "@/lib/telematics-utils";

export function UberSpinner({ label = "Loading…" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-zinc-400">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function UberNavbar({ user, tabs, activeTab, onTabChange, onSwitchUser }) {
  return (
    <header className="border-b border-[#222222] bg-black">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-3 sm:px-6">
        <Link href="/telematics/uber" className="shrink-0">
          <span className="text-xl font-bold text-white">Uber</span>
          <span className="mt-0.5 block text-xs text-zinc-500">Telematics API — Internal Portal</span>
        </Link>
        <nav className="hidden flex-1 flex-wrap justify-center gap-1 lg:flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-white/10 text-white"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <div className="hidden text-right text-sm sm:block">
            <p className="font-medium text-white">{user.name}</p>
            <p className="text-zinc-500">{user.role}</p>
          </div>
          <button
            type="button"
            onClick={onSwitchUser}
            className="rounded border border-zinc-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-900 sm:text-sm"
          >
            Switch User
          </button>
        </div>
      </div>
      <div className="border-t border-[#222222] lg:hidden">
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2 sm:px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`shrink-0 rounded px-3 py-1 text-xs font-medium ${
                activeTab === tab.id ? "bg-white/10 text-white" : "text-zinc-400"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function UberStatusBar({ degraded, latency, lastUpdated }) {
  return (
    <div className="border-b border-[#222222] bg-[#111111] px-4 py-2 text-sm sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 text-zinc-400">
        <span className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${degraded ? "bg-red-500" : "bg-emerald-500"}`}
            aria-hidden
          />
          {degraded ? "Degraded" : "API Operational"}
        </span>
        <span>CMT Pipeline: Live</span>
        <span>Latency: {latency}ms avg</span>
        {lastUpdated && (
          <span className="text-zinc-500">Last updated: {formatTime(lastUpdated.toISOString())}</span>
        )}
      </div>
    </div>
  );
}

export function UberFooterLinks() {
  return (
    <footer className="mt-12 border-t border-[#222222] bg-[#0a0a0a] px-4 py-6 text-sm sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-wrap gap-4 text-zinc-500">
        <Link href="/telematics/insurer" className="hover:text-white">
          View Insurer Portal
        </Link>
        <Link href="/telematics/docs" className="hover:text-white">
          API Documentation
        </Link>
        <Link href="/telematics/sandbox" className="text-amber-400 hover:text-amber-300">
          Sandbox
        </Link>
        <Link href="/telematics" className="hover:text-white">
          ← Back to Platform
        </Link>
      </div>
    </footer>
  );
}

export function UberSecondaryButton({ children, onClick, disabled, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded border border-zinc-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-50 sm:text-sm ${className}`}
    >
      {children}
    </button>
  );
}

export function UberDangerButton({ children, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded border border-red-800 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-950 disabled:opacity-50 sm:text-sm"
    >
      {children}
    </button>
  );
}

export function UberSelect({ className = "", children, ...props }) {
  return (
    <select
      className={`rounded border border-zinc-700 bg-[#111111] px-3 py-2 text-sm text-white focus:border-zinc-500 focus:outline-none ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

export function UberInput({ className = "", ...props }) {
  return (
    <input
      className={`rounded border border-zinc-700 bg-[#111111] px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none ${className}`}
      {...props}
    />
  );
}

export function AlertFeedCard({ alert }) {
  return (
    <div
      className={`rounded-lg border border-[#222222] border-l-4 bg-[#111111] p-4 ${alert.borderClass}`}
    >
      <p className="text-sm text-white">
        <span className="mr-2">{alert.icon}</span>
        <span className="font-semibold">{alert.severity}</span>
        <span className="mx-2 text-zinc-600">—</span>
        {alert.description}
      </p>
      <p className="mt-2 text-xs text-zinc-500">{alert.timeLabel}</p>
    </div>
  );
}

export function SeverityBadge({ severity }) {
  const cls =
    severity === "CRITICAL"
      ? "bg-red-500/20 text-red-400"
      : severity === "WARNING"
        ? "bg-amber-500/20 text-amber-400"
        : "bg-zinc-700 text-zinc-300";
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${cls}`}>
      {severity}
    </span>
  );
}
