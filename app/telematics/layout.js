import TelematicsShell from "./TelematicsShell";

export const metadata = {
  title: "Uber Telematics",
  description: "Telematics API simulation — partner and insurer portals",
  robots: { index: false, follow: false },
};

export default function TelematicsLayout({ children }) {
  return (
    <TelematicsShell>
      <div className="min-h-screen bg-black font-sans text-zinc-100 antialiased">{children}</div>
    </TelematicsShell>
  );
}
