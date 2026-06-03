"use client";

import { DocsFooter } from "@/app/components/docs-ui";
import { useDocsNav } from "@/app/components/DocsProvider";
import { DOC_SECTIONS } from "@/lib/docs-sections";
import { DEFAULT_DOC_SECTION } from "@/lib/uber-docs-nav";

export default function DocsContent() {
  const { activeSection } = useDocsNav();
  const render = DOC_SECTIONS[activeSection] ?? DOC_SECTIONS[DEFAULT_DOC_SECTION];
  const Section = render;

  return (
    <main
      id="docs-container"
      className="mx-auto max-w-3xl px-6 py-10 text-black sm:px-10 sm:py-14 lg:py-16"
    >
      <Section key={activeSection} />
      <DocsFooter text="Uber Fake API — for integration practice only. Not affiliated with Uber." />
    </main>
  );
}
