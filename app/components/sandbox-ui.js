import Link from "next/link";

export function SandboxNavbar() {
  return (
    <header className="border-b border-zinc-800 bg-black">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/telematics/sandbox" className="text-lg font-bold text-white hover:opacity-90">
            Uber Telematics
          </Link>
          <span className="rounded bg-amber-500/20 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-amber-400">
            SANDBOX ENV
          </span>
        </div>
        <nav className="flex flex-wrap gap-2 text-sm">
          <Link href="/telematics/uber" className="text-zinc-400 hover:text-white">
            Uber Portal
          </Link>
          <Link href="/telematics/insurer" className="text-zinc-400 hover:text-white">
            Insurer Portal
          </Link>
          <Link href="/telematics/docs" className="text-zinc-400 hover:text-white">
            API Docs
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SandboxFooter() {
  return (
    <footer className="mt-12 border-t border-zinc-800 px-4 py-6 text-sm sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-wrap gap-4 text-zinc-500">
        <Link href="/telematics" className="hover:text-white">
          ← Back to Platform
        </Link>
        <Link href="/telematics/uber" className="hover:text-white">
          Uber Portal
        </Link>
        <Link href="/telematics/insurer" className="hover:text-white">
          Insurer Portal
        </Link>
        <Link href="/telematics/sandbox" className="text-amber-400 hover:text-amber-300">
          Sandbox
        </Link>
        <Link href="/telematics/docs" className="hover:text-white">
          API Documentation
        </Link>
      </div>
    </footer>
  );
}

export function ConfirmModal({ open, title, message, confirmLabel, onConfirm, onCancel, danger }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/70" onClick={onCancel} aria-label="Close" />
      <div className="relative w-full max-w-md rounded-xl border border-zinc-800 bg-[#111111] p-6">
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <p className="mt-2 text-sm text-zinc-400">{message}</p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded px-4 py-2 text-sm font-medium ${
              danger
                ? "border border-red-800 text-red-400 hover:bg-red-950"
                : "bg-white text-black hover:bg-zinc-200"
            }`}
          >
            {confirmLabel}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded border border-zinc-600 px-4 py-2 text-sm text-white hover:bg-zinc-800"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
