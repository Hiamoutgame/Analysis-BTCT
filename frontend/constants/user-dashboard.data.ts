import type {
  AnalyticsBar,
  DashboardStat,
  ProgressSegment,
  ProjectTask,
  TeamActivity,
} from "@/interface/user-dashboard.interface";

export const dashboardStats: DashboardStat[] = [
  {
    id: "total-projects",
    title: "Total Projects",
    value: "24",
    trend: "+6",
    note: "Increased from last month",
  },
  {
    id: "ended-projects",
    title: "Ended Projects",
    value: "10",
    trend: "+4",
    note: "Increased from last month",
  },
  {
    id: "running-projects",
    title: "Running Projects",
    value: "12",
    trend: "+2",
    note: "Increased from last month",
  },
  {
    id: "pending-projects",
    title: "Pending Project",
    value: "2",
    trend: "0",
    note: "On discuss",
  },
];

export const analyticsBars: AnalyticsBar[] = [
  { day: "S", height: 94, style: "striped" },
  { day: "M", height: 106, style: "accent" },
  { day: "T", height: 96, style: "solid", label: "74%" },
  { day: "W", height: 112, style: "accent" },
  { day: "T", height: 92, style: "striped" },
  { day: "F", height: 84, style: "striped" },
  { day: "S", height: 88, style: "striped" },
];

export const projectTasks: ProjectTask[] = [
  {
    id: "task-api",
    title: "Develop API Endpoints",
    dueDate: "Nov 26, 2024",
    status: "done",
  },
  {
    id: "task-onboarding",
    title: "Onboarding Flow",
    dueDate: "Nov 29, 2024",
    status: "in-progress",
  },
  {
    id: "task-dashboard",
    title: "Build Dashboard",
    dueDate: "Nov 30, 2024",
    status: "todo",
  },
  {
    id: "task-optimize",
    title: "Optimize Page Load",
    dueDate: "Dec 5, 2024",
    status: "in-progress",
  },
  {
    id: "task-cross-browser",
    title: "Cross-browser Testing",
    dueDate: "Dec 6, 2024",
    status: "todo",
  },
];

export const teamActivities: TeamActivity[] = [
  {
    id: "alexandra",
    name: "Alexandra Deff",
    task: "Working on GitHub project repository",
    status: "completed",
    initials: "AD",
  },
  {
    id: "edwin",
    name: "Edwin Adenike",
    task: "Working on integrate user authentication system",
    status: "in-progress",
    initials: "EA",
  },
  {
    id: "isaac",
    name: "Isaac Oluwatemilolun",
    task: "Working on develop search and filter functionality",
    status: "pending",
    initials: "IO",
  },
  {
    id: "david",
    name: "David Oshodi",
    task: "Working on responsive layout for homepage",
    status: "in-progress",
    initials: "DO",
  },
];

export const progressSegments: ProgressSegment[] = [
  { label: "Completed", value: 41, tone: "strong" },
  { label: "In Progress", value: 34, tone: "medium" },
  { label: "Pending", value: 25, tone: "muted" },
];

export const reminderInfo = {
  title: "Meeting with Arc Company",
  time: "02:00 pm - 04:00 pm",
};

