import MapistryNav from "@/components/MapistryNav";

export const metadata = {
  title: "Mapistry",
  description: "Environmental compliance platform — API sandbox",
};

export default function MapistryLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#F7F8F5] font-sans text-[#1A1A1A] antialiased">
      <MapistryNav />
      {children}
    </div>
  );
}
