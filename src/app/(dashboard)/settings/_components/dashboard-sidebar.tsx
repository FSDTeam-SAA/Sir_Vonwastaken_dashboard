"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Activity,
  Bot,
  FileText,
  Gauge,
  Globe2,
  LogOut,
  Mail,
  WandSparkles,
} from "lucide-react";
import { signOut } from "next-auth/react";
import LogoutModal from "@/components/modals/logout-modal";

const nav = [
  { href: "/", label: "Overview", icon: Gauge },
  { href: "/trends", label: "Trends Explorer", icon: Globe2 },
  { href: "/studio", label: "Content Studio", icon: WandSparkles },
  { href: "/email", label: "Email Assistant", icon: Mail },
  { href: "/profile", label: "Creator Profile", icon: Bot },
  { href: "/analytics", label: "Analytics & Learning", icon: Activity },
  { href: "/settings", label: "Settings", icon: FileText },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogout = async () => {
    setIsLogoutModalOpen(false);
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <>
      <aside className="dashboard-sidebar fixed inset-y-0 z-20 hidden w-60 border-r border-white/10 bg-[#10101a] px-4 py-5 lg:block">
        <Link href="/" className="mb-8 flex items-center gap-3 px-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-cyan-400 text-base font-black text-white">
            SV
          </span>
          <span className="font-semibold tracking-tight text-white">Signal Studio</span>
        </Link>

        <nav className="space-y-1">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`dashboard-nav-link group flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition ${active ? "dashboard-nav-active border-cyan-300/30 bg-cyan-300/10 font-semibold text-cyan-200 shadow-[inset_3px_0_0_#67e8f9]" : "border-transparent text-slate-400 hover:bg-white/5 hover:text-white"}`}
              >
                <Icon className={`h-4 w-4 ${active ? "text-cyan-300" : "text-slate-500 group-hover:text-slate-300"}`} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-5 left-4 right-4">
          <button
            type="button"
            onClick={() => setIsLogoutModalOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-400/25 bg-rose-400/10 px-3 py-2.5 text-sm font-medium text-rose-200 transition hover:bg-rose-400/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/60"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </aside>

      <div className="dashboard-mobile-nav fixed bottom-3 left-3 right-3 z-40 flex gap-1 overflow-x-auto rounded-2xl border border-white/10 bg-[#10101a]/95 p-2 backdrop-blur-xl lg:hidden">
        {nav.map(({ href, label }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return <Link key={href} href={href} className={`whitespace-nowrap rounded-xl px-3 py-2 text-xs ${active ? "bg-cyan-300/10 text-cyan-200" : "text-slate-400"}`}>{label}</Link>;
        })}
      </div>

      <LogoutModal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} onConfirm={handleLogout} />
    </>
  );
}
