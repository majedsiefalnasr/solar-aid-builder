import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  FileText,
  MessageSquare,
  UserPlus,
  X,
  XCircle,
} from "lucide-react";
import { useWorkflow } from "@/lib/workflow-store";
import {
  buildNotifications,
  isRead,
  markRead,
  type AppNotification,
  type NotificationKind,
} from "@/lib/notifications";
import type { Role } from "@/lib/dashboard-data";

const ICON_BY_KIND: Record<NotificationKind, typeof Bell> = {
  report_late: AlertTriangle,
  report_due_soon: AlertTriangle,
  report_pending_review: ClipboardCheck,
  report_approved: CheckCircle2,
  report_rejected: XCircle,
  project_pending_review: FileText,
  project_assigned: UserPlus,
  quote_ready: FileText,
  payment_due: CreditCard,
  payment_pending_verify: CreditCard,
  payment_verified: CheckCircle2,
  field_assigned: UserPlus,
  chat_unread: MessageSquare,
};

const SEVERITY_TONE: Record<AppNotification["severity"], string> = {
  info: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200",
  danger: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200",
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200",
};

// Subscribe to read-state changes so the bell badge re-renders.
function subscribeRead(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("tamm-notifications-read", cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener("tamm-notifications-read", cb);
    window.removeEventListener("storage", cb);
  };
}

function useReadVersion() {
  return useSyncExternalStore(
    subscribeRead,
    () => (typeof window === "undefined" ? "0" : localStorage.getItem("tamm_notifications_read_v1") ?? "0"),
    () => "0",
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "الآن";
  if (m < 60) return `منذ ${m} دقيقة`;
  const h = Math.floor(m / 60);
  if (h < 24) return `منذ ${h} ساعة`;
  const d = Math.floor(h / 24);
  if (d < 7) return `منذ ${d} يوم`;
  return new Date(iso).toLocaleDateString("ar");
}

export function NotificationsBell({ role }: { role: Role }) {
  const store = useWorkflow();
  useReadVersion(); // re-render on read changes
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const all = useMemo(
    () =>
      buildNotifications({
        role,
        projects: store.projects,
        reports: store.reports,
        threads: store.threads,
      }),
    [role, store.projects, store.reports, store.threads],
  );

  const unreadCount = useMemo(() => all.filter((n) => !isRead(n.id)).length, [all]);

  // Close on outside click + Escape
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function handleClick(n: AppNotification) {
    markRead([n.id]);
    setOpen(false);
    navigate({
      to: "/dashboard",
      search: { role, section: n.link.section, projectId: n.link.projectId },
    });
  }

  function markAll() {
    markRead(all.map((n) => n.id));
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition hover:border-primary hover:text-primary"
        aria-label="الإشعارات"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -left-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 top-12 z-50 w-[360px] overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-elevated"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <div className="text-sm font-extrabold text-ink">الإشعارات</div>
              <div className="text-[11px] text-muted-foreground">
                {unreadCount > 0 ? `${unreadCount} غير مقروءة` : "كل الإشعارات مقروءة"}
              </div>
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAll}
                  className="rounded-full px-3 py-1 text-[11px] font-bold text-primary hover:bg-primary-soft"
                >
                  تعليم الكل كمقروء
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted"
                aria-label="إغلاق"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="max-h-[480px] overflow-y-auto">
            {all.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Bell className="mx-auto h-8 w-8 text-muted-foreground/50" />
                <p className="mt-3 text-sm font-bold text-ink">لا توجد إشعارات</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  ستصلك تنبيهات بكل تحديث مهم
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {all.slice(0, 20).map((n) => {
                  const Icon = ICON_BY_KIND[n.kind];
                  const read = isRead(n.id);
                  return (
                    <li key={n.id}>
                      <button
                        onClick={() => handleClick(n)}
                        className={`flex w-full items-start gap-3 px-4 py-3 text-right transition hover:bg-muted/60 ${
                          read ? "opacity-70" : ""
                        }`}
                      >
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${SEVERITY_TONE[n.severity]}`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <div className="truncate text-sm font-bold text-ink">{n.title}</div>
                            {!read && (
                              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                            )}
                          </div>
                          {n.body && (
                            <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                              {n.body}
                            </div>
                          )}
                          <div className="mt-1 text-[10px] font-semibold text-muted-foreground/80">
                            {timeAgo(n.at)}
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
