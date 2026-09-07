"use client";
import type React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { signOut } from "next-auth/react";
import {
  Activity,
  ArrowUpRight,
  Bot,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  FileText,
  Gauge,
  Globe2,
  LogOut,
  Mail,
  RefreshCw,
  Search,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  WandSparkles,
  X,
} from "lucide-react";
import {
  apiConfigured,
  formatDate,
  GeneratedPackage,
  Trend,
} from "@/lib/intelligence-api";
import {
  useDashboard,
  useEmailDrafts,
  useFeedback,
  useGenerate,
  useSponsorships,
  useTrends,
} from "@/lib/intelligence-hooks";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import DashboardUserSummary from "./dashboard-user-summary";
import LogoutModal from "@/components/modals/logout-modal";
import {
  StateEmpty,
  StateError,
  StateSkeleton,
} from "@/components/shared/async-states";

const nav = [
  { href: "/", label: "Overview", icon: Gauge },
  { href: "/trends", label: "Trends Explorer", icon: Globe2 },
  { href: "/studio", label: "Content Studio", icon: WandSparkles },
  { href: "/email", label: "Email Assistant", icon: Mail },
  { href: "/profile", label: "Creator Profile", icon: Bot },
  { href: "/analytics", label: "Analytics & Learning", icon: Activity },
  { href: "/settings", label: "Settings", icon: FileText },
];
export function Shell({
  children,
  title,
  eyebrow,
}: {
  children: React.ReactNode;
  title: string;
  eyebrow?: string;
}) {
  const pathname = usePathname();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogout = async () => {
    setIsLogoutModalOpen(false);
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="studio-shell min-h-screen ">
      <aside className="fixed inset-y-0 z-20 hidden w-60 border-r border-white/10 bg-[#10101a] px-4 py-5 lg:block ">
        <Link href="/" className="mb-8 flex items-center gap-3 px-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-cyan-400 text-base font-black">
            SV
          </span>
          <span className="font-semibold tracking-tight">Signal Studio</span>
        </Link>
        <nav className="space-y-1">
          {nav.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`group flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition ${active ? "studio-nav-active border-cyan-300/30 bg-cyan-300/10 font-semibold text-cyan-200 shadow-[inset_3px_0_0_#67e8f9]" : "studio-nav-link border-transparent text-slate-400 hover:bg-white/5 hover:text-white"}`}
              >
                <Icon
                  className={`h-4 w-4 ${active ? "text-cyan-300" : "text-slate-500 group-hover:text-slate-300"}`}
                />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-5 left-4 right-4">
          <button
            type="button"
            onClick={() => setIsLogoutModalOpen(true)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-rose-400/25 bg-rose-400/10 px-3 py-2.5 text-sm font-medium text-rose-200 transition hover:bg-rose-400/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/60"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </aside>
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />
      <main className="lg:pl-60 ">
        <header className="sticky top-0 z-10 border-b border-white/10 bg-[#0b0b12]/90 py-4 backdrop-blur-xl">
          <div className="flex w-full items-center justify-between gap-4 px-4 sm:px-6">
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-fuchsia-400">
                {eyebrow || "Creator workspace"}
              </p>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {title}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <DashboardUserSummary />
              <ThemeToggle />
            </div>
          </div>
          <div className="mt-4 flex w-full gap-1 overflow-x-auto px-4 sm:px-6 lg:hidden">
            {nav.map(({ href, label }) => {
              const active =
                href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`studio-nav-link whitespace-nowrap rounded-full border px-3 py-1.5 text-xs ${active ? "studio-nav-active border-cyan-300/40 bg-cyan-300/10 text-cyan-200" : "border-white/10 text-slate-400"}`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </header>
        <div className="w-full px-4 py-5 sm:px-6 sm:py-7">
          {children}
        </div>
      </main>
    </div>
  );
}
function ConfigNotice() {
  return (
    <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-6 ">
      <div className="flex gap-3">
        <CircleAlert className="h-5 w-5 shrink-0 text-amber-300" />
        <div>
          <h2 className="font-semibold">Backend configuration needed</h2>
          <p className="mt-1 text-sm text-slate-400">
            Add NEXT_PUBLIC_API_ORIGIN and NEXT_PUBLIC_CREATOR_CHANNEL_ID to
            .env.local, then restart Next.js.
          </p>
          <Link
            href="/settings"
            className="mt-4 inline-flex items-center gap-1 text-sm text-cyan-300"
          >
            Open settings <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
function Stat({
  label,
  value,
  detail,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  detail: string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[.035] p-5 ">
      <div className={`mb-5 h-1 w-10 rounded-full ${accent}`} />
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-2 text-xs text-slate-500">{detail}</p>
    </div>
  );
}
function TrendCard({
  trend,
  onFeedback,
  onGenerate,
  generating,
}: {
  trend: Trend;
  onFeedback: (action: "accept" | "reject" | "ignore") => void;
  onGenerate: () => void;
  generating?: boolean;
}) {
  const [localGenerating, setLocalGenerating] = useState(false);
  const handleGenerate = () => {
    setLocalGenerating(true);
    onGenerate();
    window.setTimeout(() => setLocalGenerating(false), 2000);
  };
  void generating;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[.035] p-5 transition hover:border-fuchsia-400/30 ">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="rounded-full bg-cyan-400/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-cyan-300">
            {trend.platform || "source"}
          </span>
          <h3 className="mt-3 line-clamp-2 font-medium leading-6">
            {trend.title || "Untitled trend"}
          </h3>
        </div>
        <span className="rounded-lg bg-fuchsia-400/10 px-2 py-1 text-sm font-semibold text-fuchsia-300">
          {typeof trend.score === "number" ? trend.score.toFixed(1) : "—"}
        </span>
      </div>
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-400">
        {trend.analysis?.summary || "No summary was returned by the backend."}
      </p>
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
        <span>{trend.analysis?.category || "Uncategorized"}</span>
        <span>•</span>
        <span>{trend.analysis?.format || "Format unavailable"}</span>
        <span>•</span>
        <span>{formatDate(trend.ranked_at)}</span>
      </div>
      <div className="mt-5 flex items-center gap-2 border-t border-white/10 pt-4">
        <button
          onClick={() => onFeedback("accept")}
          className="rounded-lg p-2 text-emerald-300 hover:bg-emerald-400/10"
          aria-label="Accept trend"
        >
          <ThumbsUp className="h-4 w-4" />
        </button>
        <button
          onClick={() => onFeedback("reject")}
          className="rounded-lg p-2 text-rose-300 hover:bg-rose-400/10"
          aria-label="Reject trend"
        >
          <ThumbsDown className="h-4 w-4" />
        </button>
        <button
          disabled={localGenerating}
          onClick={handleGenerate}
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs font-medium hover:bg-white/15 disabled:opacity-50"
        >
          <Sparkles className="h-3.5 w-3.5 text-fuchsia-300" />{" "}
          {localGenerating ? "Generating…" : "Generate"}
        </button>
        {trend.url && (
          <a
            href={trend.url}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg p-2 text-slate-400 hover:bg-white/10"
            aria-label="Open source"
          >
            <ArrowUpRight className="h-4 w-4" />
          </a>
        )}
      </div>
    </div>
  );
}
function ErrorState({
  message,
  retry,
}: {
  message: string;
  retry: () => void;
}) {
  return (
    <StateError
      message={message}
      action={{ label: "Try again", onClick: retry }}
    />
  );
}
function GeneratedResult({ pkg }: { pkg: GeneratedPackage }) {
  const [expanded, setExpanded] = useState(false);
  const copyScript = () =>
    navigator.clipboard
      ?.writeText(pkg.script_draft || "")
      .then(() => toast.success("Full script copied"));
  return (
    <section className="mb-6 rounded-2xl border border-fuchsia-400/25 bg-fuchsia-400/5 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[.2em] text-fuchsia-300">
            Generated package ready
          </p>
          <h2 className="mt-1 text-lg font-semibold">
            {pkg.trend_title || "Content package"}
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={copyScript}
            className="rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-300 hover:bg-white/10"
          >
            Copy full script
          </button>
          <Link
            href="/studio"
            className="rounded-xl bg-white/10 px-3 py-2 text-xs text-slate-200 hover:bg-white/15"
          >
            Open in Content Studio
          </Link>
        </div>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <p className="mb-2 text-xs uppercase tracking-wider text-slate-500">
            Suggested titles
          </p>
          <ul className="space-y-2 text-sm text-slate-300">
            {(pkg.titles || []).slice(0, 3).map((title, i) => (
              <li key={i} className="rounded-lg bg-black/20 p-3">
                {title}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Script preview
            </p>
            <button
              onClick={() => setExpanded((open) => !open)}
              className="text-xs text-cyan-300 hover:underline"
            >
              {expanded ? "Collapse" : "Show full script"}
            </button>
          </div>
          <pre
            className={`${expanded ? "max-h-[36rem]" : "max-h-56"} overflow-y-auto whitespace-pre-wrap rounded-xl bg-black/30 p-4 text-sm leading-6 text-slate-300`}
          >
            {pkg.script_draft || "No script returned."}
          </pre>
        </div>
      </div>
    </section>
  );
}
function paginationItems(page: number, totalPages: number) {
  if (totalPages <= 7)
    return Array.from({ length: totalPages }, (_, index) => index + 1) as (
      | number
      | string
    )[];
  const items: (number | string)[] = [1];
  if (page > 3) items.push("start-ellipsis");
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);
  for (let value = start; value <= end; value += 1) items.push(value);
  if (page < totalPages - 2) items.push("end-ellipsis");
  items.push(totalPages);
  return items;
}
export function DashboardHome() {
  const q = useDashboard();
  const trendsQuery = useTrends();
  const sponsorships = useSponsorships();
  const drafts = useEmailDrafts();
  const trends = q.data?.top_trends || [];
  const totalTrends = trendsQuery.data?.length ?? 0;
  const fb = useFeedback();
  const gen = useGenerate();
  const [generated, setGenerated] = useState<GeneratedPackage | null>(null);
  const sponsorshipCount = Math.max(
    Number(q.data?.sponsorship_emails || 0),
    sponsorships.data?.length || 0,
  );
  const draftCount = Math.max(
    Number(q.data?.pending_email_drafts || 0),
    drafts.data?.length || 0,
  );
  const refreshDashboard = () => {
    void q.refetch();
    void trendsQuery.refetch();
    void sponsorships.refetch();
    void drafts.refetch();
  };
  const isRefreshing = q.isFetching || trendsQuery.isFetching || sponsorships.isFetching || drafts.isFetching;
  if (!apiConfigured())
    return (
      <Shell title="Your signal, at a glance">
        <ConfigNotice />
      </Shell>
    );
  return (
    <Shell title="Your signal, at a glance" eyebrow="Overview">
      <div className="mb-8 flex items-end justify-between ">
        <div>
          <p className="max-w-xl text-sm leading-6 text-slate-400">
            Discover the next video opportunity from YouTube, Reddit, and Google
            Trends.
          </p>
        </div>
        <button
          type="button"
          disabled={isRefreshing}
          onClick={refreshDashboard}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>
      {q.isLoading ? (
        <StateSkeleton variant="profile" />
      ) : q.isError ? (
        <ErrorState
          message={(q.error as Error).message}
          retry={() => q.refetch()}
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat
              label="Total trends"
              value={trendsQuery.isLoading ? "—" : totalTrends}
              detail="Available trend opportunities"
              accent="bg-emerald-400"
            />
            <Stat
              label="Videos analyzed"
              value={String(q.data?.creator_profile?.video_count ?? "—")}
              detail="Creator profile data"
              accent="bg-cyan-400"
            />
            <Stat
              label="Sponsorships"
              value={sponsorshipCount}
              detail="Live sponsorship opportunities"
              accent="bg-fuchsia-400"
            />
            <Stat
              label="Pending drafts"
              value={draftCount}
              detail="Human approval required"
              accent="bg-amber-400"
            />
          </div>
          <section className="mt-8">
            {generated && <GeneratedResult pkg={generated} />}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[.2em] text-cyan-300">
                  Live opportunities
                </p>
                <h2 className="mt-1 text-xl font-semibold">Top trends</h2>
              </div>
              <Link
                href="/trends"
                className="flex items-center gap-1 text-sm text-slate-400 hover:text-white"
              >
                Explore all <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            {trends.length === 0 ? (
              <StateEmpty
                title="No opportunities yet"
                message="Run collection and ranking in your backend, then refresh this page."
                action={
                  <Link
                    href="/trends"
                    className="text-sm text-cyan-300 hover:underline"
                  >
                    Open Trends Explorer
                  </Link>
                }
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {trends.slice(0, 6).map((t) => (
                  <TrendCard
                    key={t.content_id}
                    trend={t}
                    generating={gen.isPending}
                    onFeedback={(action) =>
                      fb.mutate(
                        { id: t.content_id, action },
                        {
                          onSuccess: () =>
                            toast.success(
                              "Feedback saved — view it in Analytics & Learning",
                            ),
                          onError: (e) => toast.error((e as Error).message),
                        },
                      )
                    }
                    onGenerate={() =>
                      gen.mutate(t.content_id, {
                        onSuccess: (data) => {
                          setGenerated(data);
                          toast.success("Content package generated");
                        },
                        onError: (e) => toast.error((e as Error).message),
                      })
                    }
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </Shell>
  );
}
export function TrendsExplorer() {
  const pageSize = 9;
  const q = useTrends();
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState("all");
  const [page, setPage] = useState(1);
  const [generated, setGenerated] = useState<GeneratedPackage | null>(null);
  const fb = useFeedback();
  const gen = useGenerate();
  const filtered = useMemo(
    () =>
      (q.data || [])
        .filter(
          (t) =>
            (!search || t.title.toLowerCase().includes(search.toLowerCase())) &&
            (platform === "all" || t.platform === platform),
        )
        .sort((a, b) => (b.score || 0) - (a.score || 0)),
    [q.data, search, platform],
  );
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginatedTrends = filtered.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );
  const pageItems = paginationItems(page, totalPages);
  const firstItem = (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, filtered.length);
  useEffect(() => {
    setPage(1);
  }, [search, platform]);
  useEffect(() => {
    if (totalPages > 0 && page > totalPages) setPage(totalPages);
  }, [page, totalPages]);
  return (
    <Shell title="Trends Explorer" eyebrow="Opportunity radar">
      {!apiConfigured() ? (
        <ConfigNotice />
      ) : (
        <>
          <div className="mb-6 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search trends..."
                className="h-10 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-10 text-sm outline-none focus:border-cyan-400/60"
              />
              {search && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="h-10 rounded-xl border border-white/10 bg-[#151522] px-3 text-sm text-slate-300"
            >
              <option value="all">All platforms</option>
              <option value="youtube">YouTube</option>
              <option value="reddit">Reddit</option>
              <option value="google_trends">Google Trends</option>
            </select>
          </div>
          {generated && <GeneratedResult pkg={generated} />}
          {q.isLoading ? (
            <StateSkeleton />
          ) : q.isError ? (
            <ErrorState
              message={(q.error as Error).message}
              retry={() => q.refetch()}
            />
          ) : filtered.length === 0 ? (
            <StateEmpty
              title={
                search || platform !== "all"
                  ? "No matching trends"
                  : "No trends available"
              }
              message="Try another search or refresh after your backend finishes collecting opportunities."
            />
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {paginatedTrends.map((t) => (
                  <TrendCard
                    key={t.content_id}
                    trend={t}
                    generating={gen.isPending}
                    onFeedback={(action) =>
                      fb.mutate(
                        { id: t.content_id, action },
                        {
                          onSuccess: () =>
                            toast.success(
                              "Feedback saved — view it in Analytics & Learning",
                            ),
                          onError: (e) => toast.error((e as Error).message),
                        },
                      )
                    }
                    onGenerate={() =>
                      gen.mutate(t.content_id, {
                        onSuccess: (data) => {
                          setGenerated(data);
                          toast.success("Content package generated");
                        },
                        onError: (e) => toast.error((e as Error).message),
                      })
                    }
                  />
                ))}
              </div>
              <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-5 text-sm sm:flex-row">
                <p className="text-slate-500" aria-live="polite">
                  Showing {firstItem}–{lastItem} of {filtered.length} trends
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPage((current) => current - 1)}
                    disabled={page === 1}
                    className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-slate-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />{" "}
                    <span className="hidden sm:inline">Previous</span>
                  </button>
                  {pageItems.map((item, index) =>
                    typeof item === "string" ? (
                      <span
                        key={item}
                        className="px-2 text-slate-600"
                        aria-hidden="true"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={`${item}-${index}`}
                        type="button"
                        onClick={() => setPage(item)}
                        aria-current={item === page ? "page" : undefined}
                        className={`grid h-9 min-w-9 place-items-center rounded-lg border px-2 transition ${item === page ? "border-cyan-300/50 bg-cyan-300/15 text-cyan-200" : "border-transparent text-slate-400 hover:border-white/10 hover:bg-white/10"}`}
                      >
                        {item}
                      </button>
                    ),
                  )}
                  <button
                    type="button"
                    onClick={() => setPage((current) => current + 1)}
                    disabled={page === totalPages}
                    className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-slate-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <span className="hidden sm:inline">Next</span>{" "}
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </Shell>
  );
}
export function GenericScreen({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow: string;
  children?: React.ReactNode;
}) {
  return (
    <Shell title={title} eyebrow={eyebrow}>
      {!apiConfigured() ? (
        <ConfigNotice />
      ) : (
        children || (
          <StateEmpty
            title="No data available"
            message="This screen is ready for live backend data. Connect your backend or refresh to load it."
          />
        )
      )}
    </Shell>
  );
}
