"use client";

import Link from "next/link";
import { STATESAFE_API_TOKEN } from "@/lib/statesafe-constants";

export function SSSpinner({ label = "Loading…" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-[#6B7280]">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#C8102E] border-t-transparent" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function SSError({ message, onRetry }) {
  return (
    <div className="rounded-lg border border-red-200 bg-[#FFF0F2] p-6 text-center">
      <p className="text-[#9B0B22]">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded bg-[#C8102E] px-4 py-2 text-sm font-medium text-white hover:bg-[#9B0B22]"
        >
          Retry
        </button>
      )}
    </div>
  );
}

export function SSStatCard({ icon, label, value, subtitle, valueClassName = "" }) {
  return (
    <article className="rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">{label}</p>
          <p className={`mt-2 text-3xl font-bold text-[#1A1A1A] ${valueClassName}`}>{value}</p>
          {subtitle && <p className="mt-1 text-sm text-[#6B7280]">{subtitle}</p>}
        </div>
        <span className="text-2xl" aria-hidden>
          {icon}
        </span>
      </div>
    </article>
  );
}

export function SSCard({ title, children, className = "" }) {
  return (
    <section className={`rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm sm:p-6 ${className}`}>
      {title && <h2 className="mb-4 text-lg font-bold text-[#1A1A1A]">{title}</h2>}
      {children}
    </section>
  );
}

export function SSBadge({ children, className }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}>
      {children}
    </span>
  );
}

export function SSNavbar({ user, tabs, activeTab, onTabChange, onSwitchUser }) {
  return (
    <header className="bg-[#C8102E] text-white shadow-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-3 sm:px-6">
        <Link href="/telematics/insurer" className="flex shrink-0 items-center gap-2 font-bold">
          <span className="flex h-8 w-8 items-center justify-center rounded bg-white/15 text-sm">🛡</span>
          <span className="text-xl tracking-tight">StateSafe</span>
        </Link>
        <nav className="hidden flex-1 flex-wrap justify-center gap-1 md:flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              data-tour={tab.id === "risk" ? "nav-risk" : undefined}
              onClick={() => onTabChange(tab.id)}
              className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === tab.id ? "bg-white/20 text-white" : "text-white/85 hover:bg-white/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <div className="hidden text-right text-sm sm:block">
            <p className="font-medium">{user.name}</p>
            <p className="text-white/80">{user.role}</p>
          </div>
          <button
            type="button"
            onClick={onSwitchUser}
            className="rounded border border-white px-3 py-1.5 text-xs font-medium hover:bg-white/10 sm:text-sm"
          >
            Switch User
          </button>
        </div>
      </div>
      <div className="border-t border-white/20 md:hidden">
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2 sm:px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              data-tour={tab.id === "risk" ? "nav-risk" : undefined}
              onClick={() => onTabChange(tab.id)}
              className={`shrink-0 rounded px-3 py-1 text-xs font-medium ${
                activeTab === tab.id ? "bg-white/20" : "text-white/85"
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

export function SSWelcomeBar({ user }) {
  return (
    <div className="border-b border-[#E5E7EB] bg-[#F5F5F5] px-4 py-3 sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3">
        <p className="text-sm text-[#1A1A1A]">
          Welcome back, <strong>{user.name}</strong>
        </p>
        <SSBadge className="bg-[#C8102E] text-white">{user.role}</SSBadge>
      </div>
    </div>
  );
}

export function SSConnectionBanner() {
  return (
    <div className="border-b border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-900 sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
        Connected to Uber Telematics API — Sandbox
      </div>
    </div>
  );
}

export function SSFooterLinks() {
  return (
    <footer className="mt-12 border-t border-[#E5E7EB] bg-[#F5F5F5] px-4 py-6 text-sm sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-wrap gap-4 text-[#6B7280]">
        <Link href="/telematics" className="hover:text-[#C8102E]">
          ← Back to Platform
        </Link>
        <Link href="/telematics/uber" className="hover:text-[#C8102E]">
          View Uber Partner Portal
        </Link>
        <Link href="/telematics/docs" className="hover:text-[#C8102E]">
          API Documentation
        </Link>
        <Link href="/telematics/sandbox" className="hover:text-[#C8102E]">
          Sandbox
        </Link>
      </div>
    </footer>
  );
}

export function SSTable({ columns, rows, emptyMessage }) {
  if (!rows?.length) {
    return <p className="text-sm text-[#6B7280]">{emptyMessage}</p>;
  }
  return (
    <div className="overflow-x-auto rounded-lg border border-[#E5E7EB]">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead className="bg-[#F5F5F5]">
          <tr>
            {columns.map((col) => (
              <th
                key={col}
                className="border-b border-[#E5E7EB] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#6B7280]"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.key ?? i} className="border-b border-[#E5E7EB] last:border-0 hover:bg-[#FFF0F2]/40">
              {row.cells.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-[#333333]">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SSModal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/40" onClick={onClose} aria-label="Close" />
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h3 className="text-xl font-bold text-[#1A1A1A]">{title}</h3>
          <button type="button" onClick={onClose} className="text-2xl leading-none text-[#6B7280] hover:text-[#C8102E]">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function SSScoreBar({ label, value, max = 100 }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-[#333333]">{label}</span>
        <span className="font-medium text-[#1A1A1A]">
          {value}/{max}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#E5E7EB]">
        <div className="h-full rounded-full bg-[#C8102E]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function SSPrimaryButton({ children, onClick, disabled, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded bg-[#C8102E] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#9B0B22] disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

export function SSInput({ className = "", ...props }) {
  return (
    <input
      className={`rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#1A1A1A] placeholder:text-[#6B7280] focus:border-[#C8102E] focus:outline-none focus:ring-1 focus:ring-[#C8102E] ${className}`}
      {...props}
    />
  );
}

export function SSSelect({ className = "", children, ...props }) {
  return (
    <select
      className={`rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#1A1A1A] focus:border-[#C8102E] focus:outline-none focus:ring-1 focus:ring-[#C8102E] ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

export function apiAuthHeaders() {
  return { Authorization: `Bearer ${STATESAFE_API_TOKEN}` };
}

export function HorizontalGradeChart({ buckets }) {
  const max = Math.max(1, ...buckets.map((b) => b.count));
  return (
    <div className="space-y-4">
      {buckets.map((b) => (
        <div key={b.label}>
          <div className="mb-1 flex justify-between text-sm">
            <span className="font-medium text-[#333333]">{b.label}</span>
            <span className="text-[#6B7280]">
              {b.count} ({b.pct}%)
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-[#E5E7EB]">
            <div
              className={`h-full rounded-full ${b.color}`}
              style={{ width: `${Math.max(4, (b.count / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
