import { cn } from "@/lib/utils";
import {
  CalendarIcon,
  ChartIcon,
  ClipboardIcon,
  GridIcon,
  HelpIcon,
  LogoutIcon,
  SettingsIcon,
  TeamIcon,
} from "@/components/homepage/icons";

type NavItem = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  section: "menu" | "general";
};

const primaryItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: GridIcon, section: "menu" },
  { id: "tasks", label: "Tasks", icon: ClipboardIcon, badge: "12+", section: "menu" },
  { id: "calendar", label: "Calendar", icon: CalendarIcon, section: "menu" },
  { id: "analytics", label: "Analytics", icon: ChartIcon, section: "menu" },
  { id: "team", label: "Team", icon: TeamIcon, section: "menu" },
];

const secondaryItems: NavItem[] = [
  { id: "settings", label: "Settings", icon: SettingsIcon, section: "general" },
  { id: "help", label: "Help", icon: HelpIcon, section: "general" },
  { id: "logout", label: "Logout", icon: LogoutIcon, section: "general" },
];

type DashboardSidebarProps = {
  activeItem?: string;
  onItemSelect?: (label: string) => void;
};

function NavButton({
  item,
  isActive,
  onSelect,
}: {
  item: NavItem;
  isActive: boolean;
  onSelect?: (label: string) => void;
}) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={() => onSelect?.(item.label)}
      className={cn(
        "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors",
        isActive ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
      )}
    >
      <span className={cn("absolute left-0 top-2 h-6 w-1 rounded-full", isActive ? "bg-slate-200" : "bg-transparent")} />
      <Icon className={cn("h-4 w-4", isActive ? "text-white" : "text-slate-400")} />
      <span className="flex-1">{item.label}</span>
      {item.badge ? (
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-semibold",
            isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
          )}
        >
          {item.badge}
        </span>
      ) : null}
    </button>
  );
}

export default function DashboardSidebar({
  activeItem = "Dashboard",
  onItemSelect,
}: DashboardSidebarProps) {
  return (
    <aside className="w-full rounded-3xl border border-slate-200 bg-white p-4 shadow-sm lg:w-[264px]">
      <div className="flex items-center gap-3 pb-6">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-slate-900 text-white">
          <span className="h-4 w-4 rounded-full border-2 border-current" />
        </span>
        <div>
          <p className="text-lg font-semibold text-slate-900">LumiFin</p>
          <p className="text-xs text-slate-400">Workspace</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Menu</p>
          <div className="mt-2 space-y-1">
            {primaryItems.map((item) => (
              <NavButton
                key={item.id}
                item={item}
                isActive={activeItem === item.label}
                onSelect={onItemSelect}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">General</p>
          <div className="mt-2 space-y-1">
            {secondaryItems.map((item) => (
              <NavButton
                key={item.id}
                item={item}
                isActive={activeItem === item.label}
                onSelect={onItemSelect}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-700 p-4 text-white">
        <p className="text-sm font-semibold">Download our mobile app</p>
        <p className="mt-1 text-xs text-slate-200/90">
          Get cozy in another way and keep tracking progress everywhere.
        </p>
        <button
          type="button"
          className="mt-4 w-full rounded-xl border border-white/25 bg-white/10 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/20"
        >
          Download
        </button>
      </div>
    </aside>
  );
}
