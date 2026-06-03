import { StateSafeProvider } from "./StateSafeProvider";

export const metadata = {
  title: "StateSafe Insurance — Telematics Portal",
  description: "StateSafe Insurance partner portal powered by Uber Telematics API",
  robots: { index: false, follow: false },
};

export default function InsurerLayout({ children }) {
  return (
    <StateSafeProvider>
      <div className="min-h-screen bg-white font-sans text-[#1A1A1A] antialiased">{children}</div>
    </StateSafeProvider>
  );
}
