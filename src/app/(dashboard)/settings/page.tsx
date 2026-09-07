import React from "react";
import SettingsContainer from "./_components/settings-container";
import DashboardOverviewHeader from "../_components/dashboard-overview-header";

const SettingsPage = () => {
  return (
    <div className="settings-shell min-h-[calc(100vh-1px)]">
      <DashboardOverviewHeader
        title="Settings"
        description="Manage platform configuration and preferences"
        showThemeToggle
      />
      <SettingsContainer />
    </div>
  );
};

export default SettingsPage;
