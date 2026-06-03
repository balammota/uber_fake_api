import Link from "next/link";

export const metadata = {
  title: "Telematics API Documentation",
  robots: { index: false, follow: false },
};

export default function TelematicsDocsPage() {
  return (
    <div className="min-h-screen bg-white px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-[#1A1A1A]">Uber Telematics API Documentation</h1>
      <p className="mt-3 text-[#6B7280]">Full API reference and integration guides</p>
      <Link
        href="/#introduction"
        className="mt-8 inline-block rounded bg-[#C8102E] px-6 py-3 text-sm font-semibold text-white hover:bg-[#9B0B22]"
      >
        Open Documentation →
      </Link>
      <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
        <Link href="/telematics" className="text-[#6B7280] hover:text-[#C8102E]">
          ← Back to Platform
        </Link>
        <Link href="/telematics/sandbox" className="text-[#6B7280] hover:text-[#C8102E]">
          Sandbox
        </Link>
      </div>
    </div>
  );
}
