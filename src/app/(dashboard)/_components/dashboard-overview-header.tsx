import React from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import DashboardUserSummary from "./dashboard-user-summary";

const DashboardOverviewHeader = ({title, description, showThemeToggle = false}:{title: string, description:string, showThemeToggle?: boolean}) => {
  return (
    <header className="settings-header sticky top-0 z-50 w-full border-b border-[#E7E2DA] bg-[#F6F1EA]/95 py-4 shadow-[0_2px_10px_rgba(50,59,44,0.04)] backdrop-blur-md sm:py-5">
      <div className="flex w-full items-center justify-between gap-4 px-4 sm:px-6">
        <div>
          <h1 className="text-xl font-bold leading-tight tracking-[-0.02em] text-primary sm:text-2xl lg:text-[28px]">
            {title}
          </h1>
          <p className="mt-1 max-w-3xl text-xs font-normal leading-relaxed text-primary/75 sm:text-sm">
            {description}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DashboardUserSummary />
          {showThemeToggle && <ThemeToggle />}
        </div>
      </div>
    </header>
  );
};

export default DashboardOverviewHeader;
