"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { highlightCode } from "@/lib/prism-highlight";

/* Uber docs — strict black & white */
export const uberHeading = "text-3xl font-bold tracking-tight text-black sm:text-4xl";
export const uberSubheading = "text-2xl font-bold tracking-tight text-black sm:text-3xl";
export const uberBody = "text-base leading-relaxed text-black sm:text-lg";
export const uberSerifTitle = "font-serif text-3xl font-bold text-black sm:text-4xl";
export const uberHeroHeading =
  "text-4xl font-bold tracking-tight text-black sm:text-5xl lg:text-[3.25rem]";
export const uberHeroSubtitle = "mt-5 max-w-3xl text-lg leading-relaxed text-black sm:text-xl";

export function UberDivider() {
  return <hr className="my-14 border-0 bg-black sm:my-16" style={{ height: "18px" }} />;
}

export function UberFeature({ title, children }) {
  return (
    <p className={uberBody}>
      <strong className="font-bold">{title}</strong> {children}
    </p>
  );
}

export function DocsNav() {
  return (
    <div className="mb-12 flex items-center justify-between border-b border-black pb-4">
      <Link href="/docs" className="text-sm font-medium text-black">
        Documentation
      </Link>
    </div>
  );
}

export function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="shrink-0 border border-black px-2.5 py-1 text-xs font-medium text-black hover:bg-black hover:text-white"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export function HighlightedCode({
  code,
  language = "json",
  label,
  className = "",
  showHeader = true,
}) {
  const html = useMemo(() => highlightCode(code, language), [code, language]);
  const langClass = `language-${language}`;

  return (
    <div className={`docs-code-block ${className}`}>
      {showHeader && (
        <div className="docs-code-header">
          <span>{label || language}</span>
          <CopyButton text={code} />
        </div>
      )}
      <pre className={langClass}>
        <code className={langClass} dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  );
}

export function CodeBlock({ code, label, language = "json" }) {
  return (
    <div className="mt-4">
      {label && (
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-black">{label}</p>
      )}
      <HighlightedCode code={code} language={language} label={language} />
    </div>
  );
}

export function MethodBadge({ method, variant }) {
  const useGreen = variant === "get";
  const useBlue = variant === "post";

  let className = "border border-black px-2 py-0.5 font-mono text-xs font-bold text-black";
  if (useGreen) {
    className =
      "border border-emerald-700 bg-emerald-600 px-2 py-0.5 font-mono text-xs font-bold text-white";
  } else if (useBlue) {
    className =
      "border border-blue-700 bg-blue-600 px-2 py-0.5 font-mono text-xs font-bold text-white";
  }

  return <span className={className}>{method}</span>;
}

export function EndpointCard({ endpoint }) {
  return (
    <article className="border border-black p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <MethodBadge method={endpoint.method} />
        <code className="font-mono text-sm text-black sm:text-base">{endpoint.path}</code>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-black">{endpoint.description}</p>
      {endpoint.header && (
        <div className="mt-3 border border-black px-3 py-2">
          <p className="text-xs text-black">
            Header: <span className="font-mono font-bold">{endpoint.header}</span>
          </p>
        </div>
      )}
      {endpoint.request && <CodeBlock code={endpoint.request} label="Request body" />}
      <CodeBlock code={endpoint.response} label="Response" />
      {endpoint.errors && <CodeBlock code={endpoint.errors} label="Error responses" />}
    </article>
  );
}

export function CredentialsCard({ title, code, copyText }) {
  return <HighlightedCode code={code} language="kv" label={title} />;
}

export function DocsFooter({ text }) {
  return (
    <footer className="mt-16 border-t border-black pt-8 text-center text-xs text-black">
      {text}
    </footer>
  );
}

export function DocsTable({ children, minWidth, variant }) {
  const wrapClass =
    variant === "dark" ? "docs-table-wrap docs-table-wrap--dark" : "docs-table-wrap";

  return (
    <div className={wrapClass}>
      <table className="docs-table" style={minWidth ? { minWidth } : undefined}>
        {children}
      </table>
    </div>
  );
}

export function DocsFeatureCard({ title, children }) {
  return (
    <article className="flex h-full flex-col border border-black bg-[#FAFAFA] p-5 sm:p-6">
      <h3 className="text-lg font-bold text-black">{title}</h3>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-black sm:text-base">{children}</p>
    </article>
  );
}

export function DocsStepList({ steps }) {
  return (
    <ol className="mt-6 space-y-8">
      {steps.map((step, index) => (
        <li key={step.title} className="flex gap-4 sm:gap-6">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-black bg-black text-lg font-bold text-white"
            aria-hidden
          >
            {index + 1}
          </span>
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-black sm:text-xl">{step.title}</h3>
            <p className={`mt-2 max-w-3xl ${uberBody}`}>{step.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function DocsNextStepCard({ description, children }) {
  return (
    <article className="border border-black p-5 transition-colors hover:bg-[#FAFAFA] sm:p-6">
      <div className="text-lg font-bold text-black">{children}</div>
      <p className={`mt-2 text-sm text-black/70 sm:text-base`}>{description}</p>
    </article>
  );
}

export function ChangelogBadge({ variant, children }) {
  const className =
    variant === "current"
      ? "inline-block rounded border border-emerald-700 bg-emerald-600 px-2 py-0.5 text-xs font-medium text-white"
      : "inline-block rounded border border-zinc-400 bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-700";

  return <span className={className}>{children}</span>;
}

export function ChangelogWarning({ children }) {
  return (
    <div className="mt-4 max-w-3xl rounded border border-amber-400 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950">
      {children}
    </div>
  );
}

export function DocPage({ title, subtitle, children, hero = false }) {
  return (
    <article>
      <h1 className={hero ? uberHeroHeading : uberHeading}>{title}</h1>
      {subtitle && (
        <p className={hero ? uberHeroSubtitle : `mt-4 max-w-3xl ${uberBody}`}>{subtitle}</p>
      )}
      <div className={hero ? "mt-10" : "mt-8"}>{children}</div>
    </article>
  );
}
