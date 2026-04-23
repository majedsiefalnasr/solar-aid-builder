import { useMemo, useState } from "react";
import { MessageSquare } from "lucide-react";
import type { Role } from "@/lib/dashboard-data";
import { ChatPanel } from "./chat-panel";
import { PageHeader } from "./section-shell";
import { SectionCard } from "./dashboard-ui";
import {
  lastMessageOf,
  ROLE_USER,
  threadsForRole,
  unreadCountForRole,
  useWorkflow,
  type ChatRole,
} from "@/lib/workflow-store";

function formatWhen(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return d.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
  }
  const diff = (today.getTime() - d.getTime()) / (24 * 3600_000);
  if (diff < 2) return "أمس";
  return d.toLocaleDateString("ar-EG", { day: "numeric", month: "short" });
}

export function MessagesScreen({ role }: { role: Role }) {
  const store = useWorkflow();
  const userName = ROLE_USER[role];
  const threads = useMemo(
    () => threadsForRole(store, role as ChatRole, userName),
    [store, role, userName],
  );

  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | undefined>();
  const totalUnread = threads.reduce((s, t) => s + unreadCountForRole(t, role as ChatRole), 0);

  return (
    <>
      <PageHeader
        title="المحادثات"
        subtitle={`${threads.length} محادثة${totalUnread ? ` • ${totalUnread} غير مقروءة` : ""}`}
      />

      <SectionCard title="جميع المحادثات">
        {threads.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
            لا توجد محادثات بعد. ستظهر هنا عند بدء التواصل بين الأطراف.
          </div>
        ) : (
          <div className="grid gap-3">
            {threads.map((t) => {
              const last = lastMessageOf(t);
              const unread = unreadCountForRole(t, role as ChatRole);
              const project = t.projectId
                ? store.projects.find((p) => p.id === t.projectId)
                : undefined;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setActiveId(t.id);
                    setOpen(true);
                  }}
                  className="flex items-center gap-3 rounded-xl border border-border bg-background p-4 text-right transition hover:border-primary hover:shadow-cta"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <MessageSquare className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-extrabold text-ink">{t.title}</span>
                      <span className="text-[11px] text-muted-foreground">{formatWhen(last?.at)}</span>
                    </div>
                    <div className="mt-0.5 truncate text-xs text-muted-foreground">
                      {project ? project.name : "—"}
                    </div>
                    <div className="mt-1 truncate text-[11px] text-muted-foreground">
                      {last ? `${last.authorName}: ${last.text}` : "لا رسائل بعد"}
                    </div>
                  </div>
                  {unread ? (
                    <span className="flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-rose-500 px-2 text-[10px] font-bold text-white">
                      {unread}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        )}
      </SectionCard>

      <ChatPanel
        open={open}
        onClose={() => setOpen(false)}
        initialThreadId={activeId}
        role={role}
      />
    </>
  );
}
