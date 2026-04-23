import { useEffect, useMemo, useRef, useState } from "react";
import { Send, X } from "lucide-react";
import type { Role } from "@/lib/dashboard-data";
import {
  lastMessageOf,
  markThreadRead,
  ROLE_USER,
  sendChatMessage,
  threadsForRole,
  unreadCountForRole,
  useWorkflow,
  type ChatRole,
  type ChatThreadDoc,
} from "@/lib/workflow-store";

const ROLE_LABEL: Record<Role, string> = {
  owner: "صاحب المشروع",
  contractor: "المقاول",
  supervisor: "المشرف",
  field: "المهندس الميداني",
  admin: "إدارة تم",
};

const PARTICIPANT_LABEL: Record<ChatRole, string> = {
  owner: "المالك",
  contractor: "المقاول",
  supervisor: "المشرف",
  field: "م. ميداني",
  admin: "الإدارة",
};

function formatTime(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  if (sameDay) {
    return d.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString("ar-EG", { day: "numeric", month: "short" });
}

interface ChatPanelProps {
  open: boolean;
  onClose: () => void;
  /** Optional: limit threads to a single project. If omitted, shows all threads visible to the role. */
  projectId?: string;
  initialThreadId?: string;
  role: Role;
}

export function ChatPanel({ open, onClose, projectId, initialThreadId, role }: ChatPanelProps) {
  const store = useWorkflow();
  const userName = ROLE_USER[role];

  const threads = useMemo(() => {
    const all = threadsForRole(store, role as ChatRole, userName);
    return projectId ? all.filter((t) => t.projectId === projectId) : all;
  }, [store, role, userName, projectId]);

  const [activeId, setActiveId] = useState<string | undefined>(initialThreadId ?? threads[0]?.id);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && initialThreadId) setActiveId(initialThreadId);
  }, [open, initialThreadId]);

  useEffect(() => {
    if (!activeId && threads.length > 0) setActiveId(threads[0].id);
  }, [activeId, threads]);

  const active = threads.find((t) => t.id === activeId) ?? threads[0];

  // Mark active thread read on open / change
  useEffect(() => {
    if (open && active) markThreadRead(active.id, role as ChatRole);
  }, [open, active, role]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [active?.id, active?.messages.length]);

  if (!open) return null;

  const send = () => {
    if (!draft.trim() || !active) return;
    sendChatMessage({
      threadId: active.id,
      authorRole: role as ChatRole,
      authorName: ROLE_LABEL[role] === ROLE_USER[role] ? ROLE_USER[role] : ROLE_USER[role],
      text: draft,
    });
    setDraft("");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex h-full w-full max-w-3xl flex-col overflow-hidden border-s border-border bg-card shadow-2xl md:flex-row-reverse"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Threads list */}
        <aside className="flex w-full max-w-xs shrink-0 flex-col border-s border-border bg-muted/30 md:max-w-[260px]">
          <div className="flex h-14 items-center justify-between border-b border-border px-4">
            <span className="text-sm font-extrabold text-ink">المحادثات</span>
            <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-bold text-primary">
              {threads.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {threads.length === 0 && (
              <div className="p-6 text-center text-xs text-muted-foreground">لا توجد محادثات بعد</div>
            )}
            {threads.map((t) => {
              const isActive = t.id === active?.id;
              const last = lastMessageOf(t);
              const unread = unreadCountForRole(t, role as ChatRole);
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveId(t.id)}
                  className={`mb-1 w-full rounded-xl px-3 py-2.5 text-right transition ${
                    isActive ? "bg-primary-soft text-primary" : "hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-bold text-ink">{t.title}</span>
                    {unread ? (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
                        {unread}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-0.5 truncate text-[11px] text-muted-foreground">
                    {last?.text ?? "—"}
                  </div>
                  <div className="mt-1 text-[10px] text-muted-foreground">
                    {last ? formatTime(last.at) : ""}
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Conversation */}
        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-14 items-center justify-between border-b border-border px-4">
            <div className="min-w-0">
              <div className="truncate text-sm font-extrabold text-ink">{active?.title ?? "—"}</div>
              <div className="truncate text-[11px] text-muted-foreground">
                {active?.participants.map((p) => PARTICIPANT_LABEL[p]).join(" • ")}
              </div>
            </div>
            <button onClick={onClose} className="rounded-full p-2 text-muted-foreground hover:bg-muted">
              <X className="h-4 w-4" />
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-muted/20 p-4">
            {active?.messages.length === 0 && (
              <div className="py-12 text-center text-xs text-muted-foreground">
                ابدأ المحادثة بإرسال أول رسالة
              </div>
            )}
            {active?.messages.map((m) => {
              const mine = m.authorRole === role;
              return (
                <div key={m.id} className={`flex ${mine ? "justify-start" : "justify-end"}`}>
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                      mine
                        ? "rounded-bl-sm bg-primary text-primary-foreground"
                        : "rounded-br-sm bg-card text-ink"
                    }`}
                  >
                    {!mine && (
                      <div className="mb-0.5 text-[10px] font-bold opacity-70">{m.authorName}</div>
                    )}
                    <div className="leading-relaxed">{m.text}</div>
                    <div className={`mt-1 text-[10px] ${mine ? "opacity-80" : "text-muted-foreground"}`}>
                      {formatTime(m.at)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex items-center gap-2 border-t border-border bg-card p-3"
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={active ? "اكتب رسالة…" : "اختر محادثة"}
              disabled={!active}
              className="flex-1 rounded-full border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!active || !draft.trim()}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-cta disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" /> إرسال
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

// Compatibility shim for callers that previously requested per-project threads.
// Returns the threads from the store filtered by role and project.
export function getThreadsForProject(
  role: Role,
  projectId: string,
  storeSnapshot: { threads: ChatThreadDoc[]; projects: { id: string; ownerName: string; supervisorName?: string; fieldEngineerName?: string; contractorName?: string }[] },
): ChatThreadDoc[] {
  const userName = ROLE_USER[role];
  return threadsForRole(
    // The selector accepts the full StoreState; the shape we accept is structurally compatible.
    storeSnapshot as never,
    role as ChatRole,
    userName,
  ).filter((t) => t.projectId === projectId);
}
