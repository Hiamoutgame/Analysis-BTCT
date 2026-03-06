export type DashboardStat = {
  id: string;
  title: string;
  value: string;
  note: string;
  trend: string;
};

export type AnalyticsBar = {
  day: string;
  height: number;
  style: "solid" | "accent" | "striped";
  label?: string;
};

export type ProjectTask = {
  id: string;
  title: string;
  dueDate: string;
  status: "todo" | "in-progress" | "done";
};

export type TeamActivity = {
  id: string;
  name: string;
  task: string;
  status: "completed" | "in-progress" | "pending";
  initials: string;
};

export type ProgressSegment = {
  label: string;
  value: number;
  tone: "strong" | "medium" | "muted";
};
