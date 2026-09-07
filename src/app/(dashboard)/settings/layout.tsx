import React from "react";
import DashboardSidebar from "./_components/dashboard-sidebar";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="settings-route min-h-screen bg-[#0b0b12]">
      <DashboardSidebar />
      <main className="min-w-0 lg:pl-60">{children}</main>
    </div>
  );
}
