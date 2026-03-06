import { cn } from "@/lib/utils";

type IconProps = {
  className?: string;
};

export function SearchIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn("h-5 w-5", className)}>
      <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="m20 20-3.5-3.5" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function GridIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn("h-5 w-5", className)}>
      <rect x="4" y="4" width="6" height="6" rx="1.2" fill="currentColor" />
      <rect x="14" y="4" width="6" height="6" rx="1.2" fill="currentColor" />
      <rect x="4" y="14" width="6" height="6" rx="1.2" fill="currentColor" />
      <rect x="14" y="14" width="6" height="6" rx="1.2" fill="currentColor" />
    </svg>
  );
}

export function ClipboardIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn("h-5 w-5", className)}>
      <rect
        x="6"
        y="5"
        width="12"
        height="15"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <rect
        x="9"
        y="3"
        width="6"
        height="4"
        rx="1.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn("h-5 w-5", className)}>
      <rect
        x="4"
        y="6"
        width="16"
        height="14"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M8 3v5M16 3v5M4 10h16" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function ChartIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn("h-5 w-5", className)}>
      <path
        d="M5 18h14M8 15V9M12 15V6M16 15v-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function TeamIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn("h-5 w-5", className)}>
      <circle cx="9" cy="9" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17" cy="10" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4.5 19a4.5 4.5 0 0 1 9 0" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M14 19a3.5 3.5 0 0 1 7 0" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function SettingsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn("h-5 w-5", className)}>
      <path
        d="M12 8.6A3.4 3.4 0 1 0 12 15.4 3.4 3.4 0 0 0 12 8.6Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="m19.3 13.2.9-1.2-.9-1.2-1.7-.4a6.8 6.8 0 0 0-.8-1.8l.8-1.6-1.1-1.1-1.6.8a6.8 6.8 0 0 0-1.8-.8l-.4-1.7h-1.4l-.4 1.7a6.8 6.8 0 0 0-1.8.8l-1.6-.8-1.1 1.1.8 1.6a6.8 6.8 0 0 0-.8 1.8l-1.7.4-.9 1.2.9 1.2 1.7.4a6.8 6.8 0 0 0 .8 1.8l-.8 1.6 1.1 1.1 1.6-.8a6.8 6.8 0 0 0 1.8.8l.4 1.7h1.4l.4-1.7a6.8 6.8 0 0 0 1.8-.8l1.6.8 1.1-1.1-.8-1.6c.3-.6.6-1.2.8-1.8Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HelpIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn("h-5 w-5", className)}>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M9.8 9.2a2.4 2.4 0 1 1 3.5 2.1c-.9.5-1.3 1-1.3 2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="12" cy="16.8" r="1" fill="currentColor" />
    </svg>
  );
}

export function LogoutIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn("h-5 w-5", className)}>
      <path
        d="M9 20H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M14 8l4 4-4 4M18 12H9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BellIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn("h-5 w-5", className)}>
      <path
        d="M12 4a5 5 0 0 0-5 5v3.2L5.5 15h13l-1.5-2.8V9a5 5 0 0 0-5-5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M10 18a2 2 0 0 0 4 0" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function MailIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn("h-5 w-5", className)}>
      <rect
        x="4"
        y="6"
        width="16"
        height="12"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="m5 8 7 5 7-5" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function PlusIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn("h-5 w-5", className)}>
      <path
        d="M12 5v14M5 12h14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ArrowUpRightIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn("h-4 w-4", className)}>
      <path
        d="M8 16 16 8M10 8h6v6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PlayIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn("h-4 w-4", className)}>
      <path d="m9 7 8 5-8 5V7Z" fill="currentColor" />
    </svg>
  );
}

export function PauseIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn("h-4 w-4", className)}>
      <rect x="7" y="6" width="3.2" height="12" rx="1" fill="currentColor" />
      <rect x="13.8" y="6" width="3.2" height="12" rx="1" fill="currentColor" />
    </svg>
  );
}

export function StopIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn("h-4 w-4", className)}>
      <rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor" />
    </svg>
  );
}
