import { ChevronRight, KeyRound, UserRound } from "lucide-react";
import Link from "next/link";
import React from "react";

const SettingsContainer = () => {
  return (
    <div className="mx-auto w-full max-w-[1600px] py-4 sm:py-6">
      <div className="settings-card grid gap-4 rounded-2xl border border-[#E5E8E2] bg-white p-4 shadow-[0_4px_18px_rgba(50,59,44,0.05)] md:grid-cols-2 md:p-6">
        <Link className="settings-nav-card group flex min-h-24 w-full items-center gap-4 rounded-2xl border border-[#E3E7DF] bg-[#FAFBF9] p-4 transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-[#F5F7F3] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" href="/settings/personal-information">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><UserRound className="h-6 w-6" /></span>
          <span className="min-w-0 flex-1"><span className="block font-semibold text-[#30352D]">Profile information</span><span className="mt-1 block text-sm text-[#747A70]">Update your personal and contact details.</span></span>
          <ChevronRight className="h-5 w-5 text-[#92988E] transition-transform group-hover:translate-x-1 group-hover:text-primary" />
        </Link>

        <Link className="settings-nav-card group flex min-h-24 w-full items-center gap-4 rounded-2xl border border-[#E3E7DF] bg-[#FAFBF9] p-4 transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-[#F5F7F3] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" href="/settings/change-password">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><KeyRound className="h-6 w-6" /></span>
          <span className="min-w-0 flex-1"><span className="block font-semibold text-[#30352D]">Password & security</span><span className="mt-1 block text-sm text-[#747A70]">Keep your dashboard account protected.</span></span>
          <ChevronRight className="h-5 w-5 text-[#92988E] transition-transform group-hover:translate-x-1 group-hover:text-primary" />
        </Link>
      </div>
    </div>
  );
};

export default SettingsContainer;
