export const metadata = {
  title: "Telematics API Sandbox",
  description: "Generate test data and simulate telematics API scenarios",
  robots: { index: false, follow: false },
};

export default function SandboxLayout({ children }) {
  return <div className="min-h-screen bg-[#0a0a0a] text-zinc-100">{children}</div>;
}
