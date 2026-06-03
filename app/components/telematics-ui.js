"use client";

export function TelematicsStatCard({ label, value }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

export function TelematicsCard({ title, children, className = "" }) {
  return (
    <section className={`rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 sm:p-6 ${className}`}>
      {title && <h2 className="mb-4 text-lg font-bold text-white">{title}</h2>}
      {children}
    </section>
  );
}

export function LoadingState({ message = "Loading…" }) {
  return (
    <div className="flex min-h-[200px] items-center justify-center text-zinc-400">{message}</div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-lg border border-red-900/50 bg-red-950/30 p-6 text-center">
      <p className="text-red-400">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded border border-zinc-600 px-4 py-2 text-sm text-white hover:bg-zinc-800"
        >
          Retry
        </button>
      )}
    </div>
  );
}

export function Toast({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-lg border border-emerald-800 bg-emerald-950 px-4 py-3 text-sm text-emerald-200 shadow-lg">
      {message}
      <button
        type="button"
        onClick={onClose}
        className="ml-3 text-emerald-400 hover:text-white"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}

export function Badge({ children, className }) {
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}

export function TelematicsTable({ columns, rows, emptyMessage }) {
  if (!rows?.length) {
    return <p className="text-sm text-zinc-500">{emptyMessage}</p>;
  }
  return (
    <div className="docs-table-wrap docs-table-wrap--dark">
      <table className="docs-table min-w-[640px]">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.key ?? i} className="hover:bg-zinc-800/40">
              {row.cells.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PrimaryButton({ children, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded bg-white px-4 py-2 text-sm font-medium text-black transition-opacity hover:bg-zinc-200 disabled:opacity-50"
    >
      {children}
    </button>
  );
}
