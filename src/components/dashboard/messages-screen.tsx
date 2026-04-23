import { useState } from "react";
import { MessageSquare } from "lucide-react";
import type { Role } from "@/lib/dashboard-data";
import { ChatPanel, getThreadsForProject } from "./chat-panel";
import { PageHeader } from "./section-shell";
import { SectionCard } from "./dashboard-ui";

export function MessagesScreen({ role }: { role: Role }) {
  const threads = [
    ...getThreadsForProject(role, "فيلا الياسمين — صنعاء"),
    ...getThreadsForProject(role, "شقة المعلا — عدن").map((t) => ({
      ...t,
      id: t.id + "_b",
      unread: 0,
      lastAt: "قبل 3 أيام",
    })),
  ];
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | undefined>();
  const totalUnread = threads.reduce((s, t) => s + (t.unread ?? 0), 0);

  return (
    <>
      <PageHeader
        title="المحادثات"
        subtitle={`${threads.length} محادثة${totalUnread ? ` • ${totalUnread} غير مقروءة` : ""}`}
      />

      <SectionCard title="جميع المحادثات">
        <div className="grid gap-3">
          {threads.map((t) => (
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
                  <span className="text-[11px] text-muted-foreground">{t.lastAt}</span>
                </div>
                <div className="mt-0.5 truncate text-xs text-muted-foreground">{t.subtitle}</div>
                <div className="mt-1 truncate text-[11px] text-muted-foreground">
                  {t.messages[t.messages.length - 1]?.text}
                </div>
              </div>
              {t.unread ? (
                <span className="flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-rose-500 px-2 text-[10px] font-bold text-white">
                  {t.unread}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </SectionCard>

      <ChatPanel
        open={open}
        onClose={() => setOpen(false)}
        threads={threads}
        initialThreadId={activeId}
        role={role}
      />
    </>
  );
}
