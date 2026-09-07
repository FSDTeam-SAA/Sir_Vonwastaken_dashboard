"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  FileText,
  Loader2,
  Mail,
  RefreshCw,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  EmailRecord,
  formatDate,
  formatPercent,
  GeneratedPackage,
} from "@/lib/intelligence-api";
import {
  useBuildProfile,
  useContentHistory,
  useCreatorProfile,
  useEmailActions,
  useEmailDrafts,
  useFeedback,
  useFeedbackHistory,
  useFeedbackSummary,
  useFeedbackWeights,
  useGenerate,
  useRegenerate,
  useSponsorships,
  useUpdateWeights,
  useTrends,
} from "@/lib/intelligence-hooks";
import { GenericScreen } from "./intelligence-workspace";
import {
  StateEmpty,
  StateError,
  StateSkeleton,
} from "@/components/shared/async-states";

const card = "rounded-2xl border border-white/10 bg-white/[.035] p-5";
const button =
  "inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50";
const primary =
  "inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:opacity-50";

function Busy({ label = "Working…" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Loader2 className="h-4 w-4 animate-spin" />
      {label}
    </span>
  );
}
function ErrorBox({ message, retry }: { message: string; retry: () => void }) {
  return (
    <StateError
      message={message}
      action={{ label: "Try again", onClick: retry }}
    />
  );
}
function LoadingState({
  variant = "list",
}: {
  variant?: "cards" | "panel" | "list" | "profile";
}) {
  return <StateSkeleton variant={variant} />;
}
function EmptyState({
  message,
  title = "Nothing here yet",
}: {
  message: string;
  title?: string;
}) {
  return <StateEmpty title={title} message={message} />;
}
function value(data: Record<string, unknown> | undefined, keys: string[]) {
  const found = keys.find(
    (key) => data?.[key] !== undefined && data?.[key] !== null,
  );
  return found ? String(data?.[found]) : "—";
}
function emailId(item: EmailRecord) {
  return String(item.external_id || item.id || "");
}
function emailTitle(item: EmailRecord) {
  return String(item.subject || item.title || "Untitled email");
}
function paginationItems(page: number, totalPages: number) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1) as (number | string)[];
  const items: (number | string)[] = [1];
  if (page > 3) items.push("start-ellipsis");
  for (let value = Math.max(2, page - 1); value <= Math.min(totalPages - 1, page + 1); value += 1) items.push(value);
  if (page < totalPages - 2) items.push("end-ellipsis");
  items.push(totalPages);
  return items;
}

export function ContentStudioPage() {
  const history = useContentHistory();
  const trends = useTrends();
  const [selected, setSelected] = useState<GeneratedPackage | null>(null);
  const [trendId, setTrendId] = useState("");
  const [historyPage, setHistoryPage] = useState(1);
  const generate = useMemo(
    () => trends.data?.find((t) => t.content_id === trendId),
    [trends.data, trendId],
  );
  const gen = useGenerate();
  const regen = useRegenerate();
  const historyItems = history.data || [];
  const historyPageSize = 10;
  const historyTotalPages = Math.ceil(historyItems.length / historyPageSize);
  const paginatedHistory = historyItems.slice(
    (historyPage - 1) * historyPageSize,
    historyPage * historyPageSize,
  );
  const historyPageItems = paginationItems(historyPage, historyTotalPages);
  const historyFirstItem = (historyPage - 1) * historyPageSize + 1;
  const historyLastItem = Math.min(historyPage * historyPageSize, historyItems.length);
  useEffect(() => {
    if (historyTotalPages > 0 && historyPage > historyTotalPages) {
      setHistoryPage(historyTotalPages);
    }
  }, [historyPage, historyTotalPages]);
  const run = () => {
    if (!generate) return toast.error("Select a trend first");
    gen.mutate(generate.content_id, {
      onSuccess: (data) => {
        setSelected(data);
        toast.success("Content package generated");
      },
      onError: (e) => toast.error((e as Error).message),
    });
  };
  return (
    <GenericScreen title="Content Studio" eyebrow="Create with intent">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-400">
              Turn a ranked opportunity into a complete content package.
            </p>
          </div>
          <button
            type="button"
            className={button}
            disabled={history.isFetching}
            onClick={() => void history.refetch()}
          >
            <RefreshCw className={`h-4 w-4 ${history.isFetching ? "animate-spin" : ""}`} />
            {history.isFetching ? "Refreshing…" : "Refresh history"}
          </button>
        </div>
        <section className={card}>
          <div className="flex flex-wrap items-end gap-3">
            <label className="min-w-[240px] flex-1 text-sm text-slate-400">
              Choose a trend
              <select
                value={trendId}
                onChange={(e) => setTrendId(e.target.value)}
                className="mt-2 h-10 w-full rounded-xl border border-white/10 bg-[#151522] px-3 text-slate-200"
              >
                <option value="">Select an opportunity…</option>
                {(trends.data || []).map((t) => (
                  <option key={t.content_id} value={t.content_id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </label>
            <button className={primary} disabled={gen.isPending} onClick={run}>
              {gen.isPending ? (
                <Busy label="Generating…" />
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Generate package
                </>
              )}
            </button>
          </div>
        </section>
        {selected && (
          <PackageCard
            pkg={selected}
            onRegenerate={(field) =>
              regen.mutate(
                { id: String(selected.trend_id || trendId), field },
                {
                  onSuccess: (data) => {
                    setSelected(data);
                    toast.success("Section regenerated");
                  },
                  onError: (e) => toast.error((e as Error).message),
                },
              )
            }
          />
        )}
        <section>
          <h2 className="mb-3 text-lg font-semibold">Generated history</h2>
          {history.isLoading ? (
            <LoadingState variant="list" />
          ) : history.isError ? (
            <ErrorBox
              message={(history.error as Error).message}
              retry={() => history.refetch()}
            />
          ) : historyItems.length === 0 ? (
            <EmptyState
              message="Generate your first package from a ranked opportunity to see it here."
              title="No generated packages"
            />
          ) : (
            <>
              <div className="grid gap-3 md:grid-cols-2">
              {paginatedHistory.map((pkg, index) => (
                <button
                  key={pkg._id || `${historyPage}-${index}`}
                  onClick={() => setSelected(pkg)}
                  className={
                    card + " text-left transition hover:border-cyan-300/40"
                  }
                >
                  <p className="font-medium">
                    {pkg.trend_title || "Generated content package"}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-400">
                    {pkg.script_draft ||
                      pkg.titles?.[0] ||
                      "Open to view package details"}
                  </p>
                  <p className="mt-3 text-xs text-slate-500">
                    {pkg.generated_at
                      ? new Date(pkg.generated_at).toLocaleString()
                      : "Saved package"}
                  </p>
                </button>
              ))}
              </div>
              {historyTotalPages > 1 && (
                <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-5 text-sm sm:flex-row">
                  <p className="text-slate-500" aria-live="polite">
                    Showing {historyFirstItem}–{historyLastItem} of {historyItems.length} generated packages
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button type="button" onClick={() => setHistoryPage((current) => current - 1)} disabled={historyPage === 1} className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-slate-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40">
                      <ChevronLeft className="h-4 w-4" /> <span className="hidden sm:inline">Previous</span>
                    </button>
                    {historyPageItems.map((item, index) => typeof item === "string" ? (
                      <span key={item} className="px-2 text-slate-600" aria-hidden="true">…</span>
                    ) : (
                      <button key={`${item}-${index}`} type="button" onClick={() => setHistoryPage(item)} aria-current={item === historyPage ? "page" : undefined} className={`grid h-9 min-w-9 place-items-center rounded-lg border px-2 transition ${item === historyPage ? "border-cyan-300/50 bg-cyan-300/15 text-cyan-200" : "border-transparent text-slate-400 hover:border-white/10 hover:bg-white/10"}`}>
                        {item}
                      </button>
                    ))}
                    <button type="button" onClick={() => setHistoryPage((current) => current + 1)} disabled={historyPage === historyTotalPages} className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-slate-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40">
                      <span className="hidden sm:inline">Next</span> <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </GenericScreen>
  );
}

function PackageCard({
  pkg,
  onRegenerate,
}: {
  pkg: GeneratedPackage;
  onRegenerate: (field: string) => void;
}) {
  return (
    <section className={card + " border-fuchsia-400/20"}>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[.2em] text-fuchsia-300">
            Content package
          </p>
          <h2 className="mt-1 text-xl font-semibold">
            {pkg.trend_title || "Generated idea"}
          </h2>
        </div>
        <button
          className={button}
          onClick={() =>
            navigator.clipboard
              ?.writeText(pkg.script_draft || "")
              .then(() => toast.success("Script copied"))
          }
        >
          <Copy className="h-4 w-4" /> Copy script
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <PackageList
          title="Titles"
          items={pkg.titles}
          field="titles"
          onRegenerate={onRegenerate}
        />
        <PackageList
          title="Hooks"
          items={pkg.hooks}
          field="hooks"
          onRegenerate={onRegenerate}
        />
        <div className="md:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-medium">Script draft</h3>
            <button
              onClick={() => onRegenerate("script")}
              className="text-xs text-cyan-300 hover:underline"
            >
              Regenerate
            </button>
          </div>
          <p className="whitespace-pre-wrap rounded-xl bg-black/20 p-4 text-sm leading-6 text-slate-300">
            {pkg.script_draft || "No script returned."}
          </p>
        </div>
      </div>
    </section>
  );
}
function PackageList({
  title,
  items,
  field,
  onRegenerate,
}: {
  title: string;
  items?: string[];
  field: string;
  onRegenerate: (field: string) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-medium">{title}</h3>
        <button
          onClick={() => onRegenerate(field)}
          className="text-xs text-cyan-300 hover:underline"
        >
          Regenerate
        </button>
      </div>
      <ul className="space-y-2 text-sm text-slate-300">
        {(items || []).length ? (
          items?.map((item, i) => (
            <li key={i} className="rounded-lg bg-black/20 p-3">
              {item}
            </li>
          ))
        ) : (
          <li className="text-slate-500">No data returned.</li>
        )}
      </ul>
    </div>
  );
}

export function EmailAssistantPage() {
  const sponsorships = useEmailDrafts();
  const emails = useSponsorships();
  const action = useEmailActions();
  const [active, setActive] = useState<EmailRecord | null>(null);
  const [notes, setNotes] = useState("");
  const refresh = () => {
    emails.refetch();
    sponsorships.refetch();
  };
  const run = (payload: Parameters<typeof action.mutate>[0], success: string) =>
    action.mutate(payload, {
      onSuccess: () => {
        toast.success(success);
        refresh();
      },
      onError: (e) => toast.error((e as Error).message),
    });
  return (
    <GenericScreen title="Email Assistant" eyebrow="Brand opportunities">
      <div className="space-y-6">
        <div className="flex flex-wrap justify-between gap-3">
          <p className="text-sm text-slate-400">
            Sync Gmail, identify sponsorships, and prepare replies for approval.
          </p>
          <div className="flex gap-2">
            <button
              className={button}
              disabled={action.isPending}
              onClick={() => run({ action: "sync" }, "Gmail synced")}
            >
              <Mail className="h-4 w-4" /> Sync Gmail
            </button>
            <button
              className={primary}
              disabled={action.isPending}
              onClick={() =>
                run({ action: "scan" }, "Sponsorship scan complete")
              }
            >
              <Sparkles className="h-4 w-4" /> Scan sponsorships
            </button>
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
          <section>
            <h2 className="mb-3 text-lg font-semibold">
              Sponsorship opportunities
            </h2>
            {emails.isLoading ? (
              <p className="text-sm text-slate-500">Loading emails…</p>
            ) : emails.isError ? (
              <ErrorBox
                message={(emails.error as Error).message}
                retry={() => emails.refetch()}
              />
            ) : (
              <div className="space-y-3">
                {(emails.data || []).length ? (
                  emails.data?.map((item, i) => (
                    <button
                      key={emailId(item) || i}
                      onClick={() => setActive(item)}
                      className={
                        card +
                        " block w-full text-left transition hover:border-cyan-300/40"
                      }
                    >
                      <div className="flex items-start gap-3">
                        <Mail className="mt-1 h-4 w-4 text-fuchsia-300" />
                        <div className="min-w-0">
                          <p className="font-medium">{emailTitle(item)}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {String(
                              item.sender || item.from || "Unknown sender",
                            )}{" "}
                            ·{" "}
                            {String(item.received_at || item.created_at || "")}
                          </p>
                          <p className="mt-2 line-clamp-2 text-sm text-slate-400">
                            {String(
                              item.snippet ||
                                item.body ||
                                "No preview available",
                            )}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className={card + " text-sm text-slate-500"}>
                    No sponsorship emails found. Sync Gmail and run a scan.
                  </div>
                )}
              </div>
            )}
          </section>
          <section>
            <h2 className="mb-3 text-lg font-semibold">Pending drafts</h2>
            {sponsorships.isLoading ? (
              <p className="text-sm text-slate-500">Loading drafts…</p>
            ) : (
              <div className="space-y-3">
                {(sponsorships.data || []).length ? (
                  sponsorships.data?.map((draft, i) => (
                    <div key={emailId(draft) || i} className={card}>
                      <p className="font-medium">{emailTitle(draft)}</p>
                      <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-sm text-slate-400">
                        {String(
                          draft.body ||
                            draft.draft ||
                            draft.reply ||
                            "Draft ready for review",
                        )}
                      </p>
                      <div className="mt-4 flex gap-2">
                        <button
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-400/10 px-3 py-2 text-xs text-emerald-300"
                          onClick={() =>
                            run(
                              { action: "approve", id: emailId(draft) },
                              "Draft approved",
                            )
                          }
                        >
                          <Check className="h-3.5 w-3.5" /> Approve
                        </button>
                        <button
                          className="inline-flex items-center gap-1 rounded-lg bg-rose-400/10 px-3 py-2 text-xs text-rose-300"
                          onClick={() =>
                            run(
                              { action: "reject", id: emailId(draft) },
                              "Draft rejected",
                            )
                          }
                        >
                          <X className="h-3.5 w-3.5" /> Reject
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={card + " text-sm text-slate-500"}>
                    No pending drafts.
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
        {active && (
          <section className={card + " border-cyan-300/20"}>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{emailTitle(active)}</h2>
              <button
                onClick={() => setActive(null)}
                className="text-slate-500 hover:text-white"
              >
                Close
              </button>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">
              {String(active.body || active.snippet || "No body returned")}
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes for the reply…"
              className="mt-4 min-h-24 w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-cyan-300/50"
            />
            <div className="mt-3 flex gap-2">
              <button
                className={button}
                disabled={action.isPending || !emailId(active)}
                onClick={() =>
                  run(
                    { action: "summarize", id: emailId(active) },
                    "Summary generated",
                  )
                }
              >
                Summarize
              </button>
              <button
                className={primary}
                disabled={action.isPending || !emailId(active)}
                onClick={() =>
                  run(
                    { action: "draft", id: emailId(active), notes },
                    "Reply draft created",
                  )
                }
              >
                Draft reply
              </button>
            </div>
          </section>
        )}
      </div>
    </GenericScreen>
  );
}

export function CreatorProfilePage() {
  const q = useCreatorProfile();
  const build = useBuildProfile();
  return (
    <GenericScreen title="Creator Profile" eyebrow="Your creative fingerprint">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-400">
            Your profile is built from the creator channel’s collected YouTube
            videos.
          </p>
          <button
            className={primary}
            disabled={build.isPending}
            onClick={() =>
              build.mutate(25, {
                onSuccess: () => {
                  toast.success("Creator profile rebuilt");
                  q.refetch();
                },
                onError: (e) => toast.error((e as Error).message),
              })
            }
          >
            {build.isPending ? (
              <Busy label="Building…" />
            ) : (
              <>
                <RefreshCw className="h-4 w-4" /> Rebuild from YouTube
              </>
            )}
          </button>
        </div>
        {q.isLoading ? (
          <LoadingState variant="profile" />
        ) : q.isError ? (
          <ErrorBox
            message={(q.error as Error).message}
            retry={() => q.refetch()}
          />
        ) : !q.data ? (
          <EmptyState
            message="Build your creator profile from YouTube to see channel metrics and content insights."
            title="No creator profile yet"
          />
        ) : (
          <ProfileData data={q.data} />
        )}
      </div>
    </GenericScreen>
  );
}
function profileNumber(data: Record<string, unknown>, keys: string[]) {
  const key = keys.find(
    (item) => data[item] !== undefined && data[item] !== null,
  );
  return key ? Number(data[key]) : null;
}
function profileMetric(
  data: Record<string, unknown>,
  keys: string[],
  formatter?: (value: number) => string,
) {
  const number = profileNumber(data, keys);
  if (number === null || !Number.isFinite(number)) return "Not available";
  return formatter ? formatter(number) : number.toLocaleString();
}
function prettyLabel(key: string) {
  return key
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
function profileValue(key: string, item: unknown) {
  if (Array.isArray(item))
    return (
      <div className="mt-2 flex flex-wrap gap-2">
        {item.map((entry, index) => (
          <span
            key={`${key}-${index}`}
            className="rounded-full bg-cyan-400/10 px-2.5 py-1 text-xs text-cyan-200"
          >
            {String(entry)}
          </span>
        ))}
      </div>
    );
  if (key === "updated_at" || key === "created_at")
    return formatDate(String(item));
  if (key.includes("engagement_rate")) return formatPercent(item);
  if (typeof item === "object" && item !== null) return JSON.stringify(item);
  return String(item);
}
function ProfileData({ data }: { data: Record<string, unknown> }) {
  const highlights = [
    {
      key: "video_count",
      label: "Videos analyzed",
      keys: ["video_count", "videoCount"],
    },
    {
      key: "subscriber_count",
      label: "Subscribers",
      keys: [
        "subscriber_count",
        "subscribers",
        "subscriberCount",
        "channel_subscribers",
      ],
    },
    {
      key: "avg_views",
      label: "Average views",
      keys: ["avg_views", "average_views", "average_view_count", "mean_views"],
    },
    {
      key: "engagement_rate",
      label: "Engagement rate",
      keys: [
        "avg_engagement_rate",
        "engagement_rate",
        "average_engagement_rate",
      ],
    },
  ];
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {highlights.map((metric) => (
          <div key={metric.key} className={card}>
            <p className="text-sm text-slate-400">{metric.label}</p>
            <p className="mt-2 text-2xl font-semibold">
              {metric.key === "engagement_rate"
                ? profileMetric(data, metric.keys, (number) =>
                    formatPercent(number),
                  )
                : profileMetric(data, metric.keys)}
            </p>
            {/* {profileNumber(data, metric.keys) === null && (
              <p className="mt-2 text-xs text-amber-200/70">
                Not returned by backend
              </p>
            )} */}
          </div>
        ))}
      </div>
      <div className={card}>
        <div className="mb-5 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-cyan-400/10">
            <UserRound className="h-5 w-5 text-cyan-300" />
          </div>
          <div>
            <h2 className="font-semibold">Profile attributes</h2>
            <p className="text-sm text-slate-500">
              Creator insights from the latest profile build
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {Object.entries(data).map(([key, item]) => (
            <div key={key} className="rounded-xl bg-black/20 p-3">
              <p className="text-xs text-slate-500">{prettyLabel(key)}</p>
              {
                <div className="mt-1 break-words text-sm leading-6 text-slate-200">
                  {profileValue(key, item)}
                </div>
              }
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function feedbackLabel(
  row: Record<string, unknown>,
  trends: { content_id: string; title: string }[],
  packages: GeneratedPackage[],
) {
  const id = String(row.trend_id || row.content_id || "");
  const trend = trends.find((item) => item.content_id === id);
  if (trend?.title) return trend.title;
  const pkg = packages.find((item) => item.trend_id === id);
  return pkg?.trend_title || (id ? `Trend ${id}` : "Trend feedback");
}
function latestFeedbackRows(rows: unknown[]) {
  const latest = new Map<string, Record<string, unknown>>();
  rows.forEach((item) => {
    const row = item as Record<string, unknown>;
    const id = String(row.trend_id || row.content_id || row._id || "");
    if (!id) return;
    const previous = latest.get(id);
    const currentTime = Date.parse(String(row.created_at || "")) || 0;
    const previousTime = Date.parse(String(previous?.created_at || "")) || 0;
    if (!previous || currentTime >= previousTime) latest.set(id, row);
  });
  return Array.from(latest.values());
}

export function AnalyticsLearningPage() {
  const [days, setDays] = useState(30);
  const summary = useFeedbackSummary(days);
  const history = useFeedbackHistory();
  const weights = useFeedbackWeights();
  const packages = useContentHistory();
  const update = useUpdateWeights();
  const feedback = useFeedback();
  const trends = useTrends();
  const summaryData = summary.data || {};
  const summaryLoading = summary.isLoading || summary.isFetching;
  const weightData =
    (weights.data?.weights as Record<string, unknown> | undefined) ||
    weights.data ||
    {};
  const recentFeedback = useMemo(
    () => latestFeedbackRows(history.data || []),
    [history.data],
  );
  const isRefreshing =
    summary.isFetching || history.isFetching || weights.isFetching;
  const refresh = () => {
    summary.refetch();
    history.refetch();
    weights.refetch();
  };
  const saveFeedback = (id: string, action: "accept" | "reject" | "ignore") =>
    feedback.mutate(
      { id, action },
      { onSuccess: refresh, onError: (e) => toast.error((e as Error).message) },
    );
  return (
    <GenericScreen title="Analytics & Learning" eyebrow="Feedback loop">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-400">
            See how your feedback changes recommendations over time.
          </p>
          <div className="flex gap-2">
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="rounded-xl border border-white/10 bg-[#151522] px-3 py-2 text-sm text-slate-300"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={365}>Last year</option>
            </select>
            <button
              type="button"
              className={button}
              disabled={isRefreshing}
              onClick={refresh}
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              {isRefreshing ? "Refreshing…" : "Refresh"}
            </button>
            <button
              className={primary}
              disabled={update.isPending}
              onClick={() =>
                update.mutate(undefined, {
                  onSuccess: () => {
                    toast.success("Recommendation weights updated");
                    weights.refetch();
                  },
                  onError: (e) => toast.error((e as Error).message),
                })
              }
            >
              {update.isPending ? (
                <Busy label="Learning…" />
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Update learning
                </>
              )}
            </button>
          </div>
        </div>
        {summary.isError ? (
          <ErrorBox
            message={(summary.error as Error).message}
            retry={() => summary.refetch()}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["Accepted", ["accept_count", "accepted", "accept"]],
              ["Rejected", ["reject_count", "rejected", "reject"]],
              ["Ignored", ["ignore_count", "ignored", "ignore"]],
              ["Total feedback", ["total_feedback", "total", "count"]],
            ].map(([label, keys]) => (
              <div key={String(label)} className={card}>
                <p className="text-sm text-slate-400">{String(label)}</p>
                <p className="mt-2 text-3xl font-semibold">
                  {summaryLoading ? (
                    <span className="inline-flex items-center gap-2 text-lg text-slate-400">
                      <Loader2 className="h-5 w-5 animate-spin" /> Loading…
                    </span>
                  ) : (
                    value(summaryData, keys as string[])
                  )}
                </p>
                <p className="mt-2 text-xs text-slate-500">Last {days} days</p>
              </div>
            ))}
          </div>
        )}
        <div className="grid gap-6 lg:grid-cols-2">
          <section className={card}>
            <h2 className="font-semibold">Current recommendation weights</h2>
            <div className="mt-4 space-y-3">
              {weights.isLoading ? (
                <p className="text-sm text-slate-500">Loading weights…</p>
              ) : Object.entries(weightData).length ? (
                Object.entries(weightData).map(([key, item]) => (
                  <div key={key}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="capitalize text-slate-400">
                        {key.replaceAll("_", " ")}
                      </span>
                      <span className="text-slate-200">
                        {typeof item === "number"
                          ? item.toFixed(3)
                          : String(item)}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-fuchsia-400 to-cyan-300"
                        style={{
                          width: `${Math.min(100, Math.max(3, Number(item) * 100 || 3))}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  No weights returned yet.
                </p>
              )}
            </div>
          </section>
          <section className={card}>
            <h2 className="font-semibold">Recent feedback</h2>
            {history.isLoading ? (
              <p className="mt-4 text-sm text-slate-500">Loading feedback…</p>
            ) : (
              <div className="mt-4 max-h-[31rem] space-y-2 overflow-y-auto pr-2">
                {recentFeedback.slice(0, 5).map((row, index) => {
                  const id = String(row.trend_id || row.content_id || "");
                  const actionName = String(row.action || row.feedback || "");
                  return (
                    <div
                      key={String(row._id || index)}
                      className="rounded-xl bg-black/20 p-3 text-sm"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span
                          className="min-w-0 truncate font-medium text-slate-200"
                          title={id}
                        >
                          {feedbackLabel(
                            row,
                            trends.data || [],
                            packages.data || [],
                          )}
                        </span>
                        <span className="text-xs text-slate-500">
                          {row.created_at
                            ? new Date(
                                String(row.created_at),
                              ).toLocaleDateString()
                            : ""}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs capitalize text-slate-500">
                          Saved feedback: {actionName || "—"}
                        </span>
                        {id && (
                          <div className="flex gap-1">
                            <button
                              disabled={feedback.isPending}
                              onClick={() => saveFeedback(id, "accept")}
                              className={`rounded-lg px-2 py-1 text-xs ${actionName === "accept" ? "bg-emerald-400/20 text-emerald-200" : "text-emerald-300 hover:bg-emerald-400/10"}`}
                            >
                              Accept
                            </button>
                            <button
                              disabled={feedback.isPending}
                              onClick={() => saveFeedback(id, "reject")}
                              className={`rounded-lg px-2 py-1 text-xs ${actionName === "reject" ? "bg-rose-400/20 text-rose-200" : "text-rose-300 hover:bg-rose-400/10"}`}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {!recentFeedback.length && (
                  <p className="text-sm text-slate-500">
                    No feedback recorded yet.
                  </p>
                )}
              </div>
            )}
          </section>
        </div>
        <div className="rounded-xl border border-amber-300/15 bg-amber-300/5 p-4 text-sm text-amber-100">
          <FileText className="mr-2 inline h-4 w-4" />
          Historical trend-score charts require a backend snapshots endpoint;
          the current API does not expose those points yet.
        </div>
        <p className="text-xs text-slate-600">
          Loaded {trends.data?.length || 0} current ranked trends for context.
        </p>
      </div>
    </GenericScreen>
  );
}
