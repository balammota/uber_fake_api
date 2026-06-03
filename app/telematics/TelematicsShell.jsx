"use client";

import { TelematicsTourProvider } from "@/components/TelematicsTour";

export default function TelematicsShell({ children }) {
  return <TelematicsTourProvider>{children}</TelematicsTourProvider>;
}
