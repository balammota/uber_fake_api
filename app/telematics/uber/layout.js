import { UberPortalProvider } from "./UberPortalProvider";

export const metadata = {
  title: "Uber Telematics — Internal Portal",
  description: "Internal portal for managing the Driver Telematics API",
  robots: { index: false, follow: false },
};

export default function UberPortalLayout({ children }) {
  return (
    <UberPortalProvider>
      <div className="min-h-screen bg-[#0a0a0a] font-sans text-white antialiased">{children}</div>
    </UberPortalProvider>
  );
}
