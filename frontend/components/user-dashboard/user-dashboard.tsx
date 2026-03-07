"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { analyticsBars, dashboardStats, progressSegments, projectTasks, reminderInfo, teamActivities } from "@/constants/user-dashboard.data";
import DashboardSidebar from "@/components/homepage/dashboard-sidebar";
import {
  ArrowUpRightIcon,
  BellIcon,
  MailIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  SearchIcon,
  StopIcon,
} from "@/components/homepage/icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getMe, logout, refresh } from "@/lib/auth-api";
import { clearAuthTokens, getAccessToken, getRefreshToken, setAuthTokens } from "@/lib/auth-storage";
import { cn } from "@/lib/utils";
import { getEmailFromToken } from "@/utils";
import { useTimeTracker } from "./use-time-tracker";

const barStyleMap = {
  solid: "bg-slate-300",
  accent: "bg-slate-900",
  striped: "bg-[repeating-linear-gradient(-45deg,#94a3b8_0_3px,#e2e8f0_3px_7px)]",
} as const;

const taskStatusMap = {
  done: "bg-emerald-100 text-emerald-700",
  "in-progress": "bg-amber-100 text-amber-700",
  todo: "bg-rose-100 text-rose-700",
} as const;

const teamStatusMap = {
  completed: "bg-emerald-100 text-emerald-700",
  "in-progress": "bg-amber-100 text-amber-700",
  pending: "bg-rose-100 text-rose-700",
} as const;

const segmentToneColorMap = {
  strong: "#0f172a",
  medium: "#475569",
  muted: "#cbd5e1",
} as const;

function SegmentLegend() {
  return (
    <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-xs text-slate-500">
      {progressSegments.map((segment) => (
        <div key={segment.label} className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: segmentToneColorMap[segment.tone] }}
          />
          <span>{segment.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function UserDashboard() {
  const router = useRouter();
  const [activeItem, setActiveItem] = useState("Dashboard");
  const [searchValue, setSearchValue] = useState("");
  const [isMeetingStarted, setIsMeetingStarted] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [currentName, setCurrentName] = useState("LumiFin User");
  const [currentEmail, setCurrentEmail] = useState("user@lumifin.local");
  const { formattedTime, isRunning, stop, toggle } = useTimeTracker();

  useEffect(() => {
    let isMounted = true;

    async function bootstrapAuth(): Promise<void> {
      const accessToken = getAccessToken();
      const refreshToken = getRefreshToken();

      if (!accessToken && !refreshToken) {
        clearAuthTokens();
        router.replace("/auth/sign-in");
        return;
      }

      try {
        let tokenToUse = accessToken;

        if (!tokenToUse && refreshToken) {
          const refreshed = await refresh(refreshToken);
          setAuthTokens({
            accessToken: refreshed.access_token,
            refreshToken: refreshed.refresh_token,
          });
          tokenToUse = refreshed.access_token;
        }

        if (!tokenToUse) {
          throw new Error("Missing access token");
        }

        const me = await getMe(tokenToUse);
        if (!isMounted) {
          return;
        }

        setCurrentName(me.full_name || "LumiFin User");
        setCurrentEmail(me.email || getEmailFromToken(tokenToUse) || "user@lumifin.local");
      } catch {
        if (refreshToken) {
          try {
            const refreshed = await refresh(refreshToken);
            setAuthTokens({
              accessToken: refreshed.access_token,
              refreshToken: refreshed.refresh_token,
            });
            const me = await getMe(refreshed.access_token);
            if (!isMounted) {
              return;
            }
            setCurrentName(me.full_name || "LumiFin User");
            setCurrentEmail(me.email || getEmailFromToken(refreshed.access_token) || "user@lumifin.local");
          } catch {
            clearAuthTokens();
            router.replace("/auth/sign-in");
            return;
          }
        } else {
          clearAuthTokens();
          router.replace("/auth/sign-in");
          return;
        }
      } finally {
        if (isMounted) {
          setIsAuthLoading(false);
        }
      }
    }

    void bootstrapAuth();

    return () => {
      isMounted = false;
    };
  }, [router]);

  async function handleLogout(): Promise<void> {
    const refreshToken = getRefreshToken();
    try {
      if (refreshToken) {
        await logout(refreshToken);
      }
    } catch {
      // Ignore logout API errors and clear local session anyway.
    } finally {
      clearAuthTokens();
      router.push("/auth/sign-in");
    }
  }

  function handleSidebarSelect(label: string): void {
    if (label.toLowerCase() === "logout") {
      void handleLogout();
      return;
    }
    setActiveItem(label);
  }

  const userInitials = useMemo(() => {
    const source = currentName.trim() || currentEmail.trim();
    if (!source) {
      return "LF";
    }

    const parts = source.split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
  }, [currentEmail, currentName]);

  const progressBackground = useMemo(() => {
    const stops = progressSegments.reduce<{ color: string; from: number; to: number }[]>(
      (result, segment) => {
        const from = result.length === 0 ? 0 : result[result.length - 1].to;
        const to = from + segment.value;

        result.push({
          color: segmentToneColorMap[segment.tone],
          from,
          to,
        });

        return result;
      },
      []
    );

    return `conic-gradient(${stops
      .map((item) => `${item.color} ${item.from}% ${item.to}%`)
      .join(", ")})`;
  }, []);

  const filteredTasks = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase();
    if (!keyword) {
      return projectTasks;
    }

    return projectTasks.filter((task) => task.title.toLowerCase().includes(keyword));
  }, [searchValue]);

  if (isAuthLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-100 p-6">
        <p className="text-sm text-slate-600">Loading your dashboard...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-2 md:p-5">
      <div className="mx-auto w-full max-w-[1500px] rounded-[28px] border border-slate-200 bg-slate-50 p-3 shadow-sm md:p-4">
        <div className="grid gap-4 lg:grid-cols-[264px_minmax(0,1fr)]">
          <DashboardSidebar activeItem={activeItem} onItemSelect={handleSidebarSelect} />

          <section className="space-y-4">
            <Card className="rounded-3xl border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <label className="relative block w-full xl:max-w-xl">
                  <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    aria-label="Search task"
                    className="h-11 rounded-2xl border-slate-200 bg-slate-50 pl-10 pr-14 text-sm"
                    placeholder="Search task"
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-400">
                    Ctrl + F
                  </span>
                </label>

                <div className="flex items-center justify-between gap-3 xl:justify-end">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 w-10 rounded-full border-slate-200 p-0"
                    >
                      <MailIcon className="h-4 w-4 text-slate-600" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 w-10 rounded-full border-slate-200 p-0"
                    >
                      <BellIcon className="h-4 w-4 text-slate-600" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                      {userInitials}
                    </span>
                    <div className="hidden pr-1 sm:block">
                      <p className="text-sm font-semibold text-slate-900">{currentName}</p>
                      <p className="text-xs text-slate-500">{currentEmail}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{activeItem}</p>
                  <h1 className="mt-1 text-4xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
                  <p className="mt-1 text-sm text-slate-500">
                    Plan, prioritize, and accomplish your tasks with ease.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button type="button" className="rounded-full px-5">
                    <PlusIcon className="mr-1 h-4 w-4" />
                    Add Project
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full border-slate-200 bg-white px-5"
                  >
                    Import Data
                  </Button>
                </div>
              </div>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
              {dashboardStats.map((stat, index) => (
                <Card
                  key={stat.id}
                  className={cn(
                    "rounded-3xl border-slate-200 bg-white p-5 shadow-sm",
                    index === 0 && "border-slate-900 bg-slate-900 text-white"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className={cn("text-sm font-medium", index === 0 ? "text-slate-100" : "text-slate-600")}>
                      {stat.title}
                    </p>
                    <span
                      className={cn(
                        "grid h-8 w-8 place-items-center rounded-full border",
                        index === 0
                          ? "border-slate-700 bg-slate-800 text-slate-200"
                          : "border-slate-200 bg-slate-50 text-slate-500"
                      )}
                    >
                      <ArrowUpRightIcon className="h-4 w-4" />
                    </span>
                  </div>
                  <p className={cn("mt-4 text-5xl font-semibold tracking-tight", index === 0 ? "text-white" : "text-slate-900")}>
                    {stat.value}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        index === 0 ? "bg-slate-700 text-slate-200" : "bg-slate-100 text-slate-600"
                      )}
                    >
                      {stat.trend}
                    </span>
                    <p className={cn("text-xs", index === 0 ? "text-slate-200" : "text-slate-500")}>{stat.note}</p>
                  </div>
                </Card>
              ))}
            </div>

            <div className="grid gap-4 xl:grid-cols-[2fr_1.1fr_1.2fr]">
              <Card className="rounded-3xl border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Project Analytics</h2>
                <div className="mt-6 flex items-end gap-3">
                  {analyticsBars.map((bar) => (
                    <div key={bar.day} className="flex flex-1 flex-col items-center gap-2">
                      <div
                        className={cn("relative w-full max-w-12 rounded-full", barStyleMap[bar.style])}
                        style={{ height: `${bar.height}px` }}
                      >
                        {bar.label ? (
                          <span className="absolute -top-5 left-1/2 -translate-x-1/2 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                            {bar.label}
                          </span>
                        ) : null}
                      </div>
                      <span className="text-xs text-slate-500">{bar.day}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="rounded-3xl border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Reminders</h2>
                <p className="mt-5 text-4xl font-medium leading-tight tracking-tight text-slate-900">
                  {reminderInfo.title}
                </p>
                <p className="mt-2 text-sm text-slate-500">Time: {reminderInfo.time}</p>
                <Button
                  type="button"
                  className="mt-6 w-full rounded-full"
                  onClick={() => setIsMeetingStarted((current) => !current)}
                >
                  <PlayIcon className="mr-1 h-4 w-4" />
                  {isMeetingStarted ? "Meeting Started" : "Start Meeting"}
                </Button>
              </Card>

              <Card className="rounded-3xl border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Project</h2>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 rounded-full border-slate-200 px-3 text-xs"
                  >
                    + New
                  </Button>
                </div>

                <div className="mt-4 space-y-3">
                  {filteredTasks.map((task) => (
                    <article key={task.id} className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2.5">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-sm font-medium text-slate-900">{task.title}</h3>
                        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", taskStatusMap[task.status])}>
                          {task.status}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">Due date: {task.dueDate}</p>
                    </article>
                  ))}
                  {filteredTasks.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-slate-200 px-3 py-5 text-center text-sm text-slate-500">
                      No task matched your keyword.
                    </p>
                  ) : null}
                </div>
              </Card>
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.7fr_1.3fr_1fr]">
              <Card className="rounded-3xl border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Team Collaboration</h2>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 rounded-full border-slate-200 px-3 text-xs"
                  >
                    + Add Member
                  </Button>
                </div>

                <div className="mt-4 space-y-3">
                  {teamActivities.map((member) => (
                    <article key={member.id} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2.5">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                        {member.initials}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-medium text-slate-900">{member.name}</h3>
                        <p className="truncate text-xs text-slate-500">{member.task}</p>
                      </div>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-medium",
                          teamStatusMap[member.status]
                        )}
                      >
                        {member.status}
                      </span>
                    </article>
                  ))}
                </div>
              </Card>

              <Card className="rounded-3xl border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Project Progress</h2>
                <div className="mt-6 grid place-items-center">
                  <div
                    className="grid h-48 w-48 place-items-center rounded-full"
                    style={{ background: progressBackground }}
                  >
                    <div className="grid h-[8.5rem] w-[8.5rem] place-items-center rounded-full bg-white text-center">
                      <p className="text-5xl font-semibold tracking-tight text-slate-900">41%</p>
                      <p className="mt-1 text-xs text-slate-500">Project ended</p>
                    </div>
                  </div>
                  <SegmentLegend />
                </div>
              </Card>

              <Card className="overflow-hidden rounded-3xl border-slate-200 bg-slate-900 p-5 text-white shadow-sm">
                <div className="rounded-2xl bg-[radial-gradient(circle_at_top_right,#334155,transparent_55%)]">
                  <h2 className="text-2xl font-semibold tracking-tight">Time Tracker</h2>
                  <p className="mt-8 text-5xl font-semibold tabular-nums">{formattedTime}</p>
                  <div className="mt-6 flex items-center gap-3 pb-1">
                    <Button
                      type="button"
                      onClick={toggle}
                      className="h-10 w-10 rounded-full p-0"
                      variant={isRunning ? "outline" : "default"}
                    >
                      {isRunning ? (
                        <PauseIcon className="h-4 w-4 text-slate-900" />
                      ) : (
                        <PlayIcon className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      type="button"
                      onClick={stop}
                      variant="outline"
                      className="h-10 w-10 rounded-full border-white/20 bg-white/5 p-0 text-white hover:bg-white/10"
                    >
                      <StopIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
