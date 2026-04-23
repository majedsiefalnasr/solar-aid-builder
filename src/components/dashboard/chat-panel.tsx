import { useEffect, useRef, useState } from "react";
import { Send, X } from "lucide-react";
import type { Role } from "@/lib/dashboard-data";

export interface ChatThread {
  id: string;
  title: string;
  subtitle: string;
  unread?: number;
  lastAt: string;
  messages: { from: "me" | "them"; sender: string; text: string; at: string }[];
}

interface ChatPanelProps {
  open: boolean;
  onClose: () => void;
  threads: ChatThread[];
  initialThreadId?: string;
  role: Role;
}

const ROLE_LABEL: Record<Role, string> = {
  owner: "صاحب المشروع",
  contractor: "المقاول",
  supervisor: "المشرف",
  field: "المهندس الميداني",
  admin: "إدارة تم",
};

export function ChatPanel({ open, onClose, threads, initialThreadId, role }: ChatPanelProps) {
  const [activeId, setActiveId] = useState(initialThreadId ?? threads[0]?.id);
  const [draft, setDraft] = useState("");
  const [localThreads, setLocalThreads] = useState(threads);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalThreads(threads);
  }, [threads]);

  useEffect(() => {
    if (open && initialThreadId) setActiveId(initialThreadId);
  }, [open, initialThreadId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeId, localThreads]);

  if (!open) return null;
  const active = localThreads.find((t) => t.id === activeId) ?? localThreads[0];

  const send = () => {
    if (!draft.trim() || !active) return;
    const newMsg = {
      from: "me" as const,
      sender: ROLE_LABEL[role],
      text: draft.trim(),
      at: "الآن",
    };
    setLocalThreads((prev) =>
      prev.map((t) => (t.id === active.id ? { ...t, messages: [...t.messages, newMsg], lastAt: "الآن" } : t)),
    );
    setDraft("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-3xl flex-col overflow-hidden border-s border-border bg-card shadow-2xl md:flex-row-reverse"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Threads list */}
        <aside className="flex w-full max-w-xs shrink-0 flex-col border-s border-border bg-muted/30 md:max-w-[260px]">
          <div className="flex h-14 items-center justify-between border-b border-border px-4">
            <span className="text-sm font-extrabold text-ink">المحادثات</span>
            <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-bold text-primary">
              {localThreads.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {localThreads.map((t) => {
              const isActive = t.id === active?.id;
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
                    {t.unread ? (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
                        {t.unread}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-0.5 truncate text-[11px] text-muted-foreground">{t.subtitle}</div>
                  <div className="mt-1 text-[10px] text-muted-foreground">{t.lastAt}</div>
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
              <div className="truncate text-[11px] text-muted-foreground">{active?.subtitle}</div>
            </div>
            <button onClick={onClose} className="rounded-full p-2 text-muted-foreground hover:bg-muted">
              <X className="h-4 w-4" />
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-muted/20 p-4">
            {active?.messages.map((m, i) => {
              const mine = m.from === "me";
              return (
                <div key={i} className={`flex ${mine ? "justify-start" : "justify-end"}`}>
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                      mine
                        ? "rounded-bl-sm bg-primary text-primary-foreground"
                        : "rounded-br-sm bg-card text-ink"
                    }`}
                  >
                    {!mine && (
                      <div className="mb-0.5 text-[10px] font-bold opacity-70">{m.sender}</div>
                    )}
                    <div className="leading-relaxed">{m.text}</div>
                    <div className={`mt-1 text-[10px] ${mine ? "opacity-80" : "text-muted-foreground"}`}>
                      {m.at}
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
              placeholder="اكتب رسالة…"
              className="flex-1 rounded-full border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-cta"
            >
              <Send className="h-3.5 w-3.5" /> إرسال
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

// ----- Mock thread data per role -----
export function getThreadsForProject(role: Role, projectName: string): ChatThread[] {
  const base: Record<Role, ChatThread[]> = {
    owner: [
      {
        id: "T1",
        title: "المقاول — شركة البناء المتقن",
        subtitle: projectName,
        unread: 2,
        lastAt: "قبل 5 دقائق",
        messages: [
          { from: "them", sender: "م. صلاح", text: "تم إنجاز جدران الدور الأول، نحتاج اعتماد المرحلة.", at: "10:32" },
          { from: "me", sender: "صاحب المشروع", text: "ممتاز، سأطلب من المشرف المعاينة اليوم.", at: "10:40" },
          { from: "them", sender: "م. صلاح", text: "بانتظار جدول الدفعة.", at: "10:55" },
        ],
      },
      {
        id: "T2",
        title: "المهندس المشرف — م. ليلى",
        subtitle: projectName,
        lastAt: "أمس",
        messages: [
          { from: "them", sender: "م. ليلى", text: "تقرير الموقع جاهز للمراجعة.", at: "أمس 16:20" },
        ],
      },
    ],
    contractor: [
      {
        id: "T1",
        title: "صاحب المشروع — أحمد الشامي",
        subtitle: projectName,
        unread: 1,
        lastAt: "قبل 5 دقائق",
        messages: [
          { from: "me", sender: "المقاول", text: "تم إنجاز جدران الدور الأول.", at: "10:32" },
          { from: "them", sender: "صاحب المشروع", text: "ممتاز، سأطلب المعاينة اليوم.", at: "10:40" },
        ],
      },
      {
        id: "T2",
        title: "المهندس المشرف — م. ليلى",
        subtitle: projectName,
        lastAt: "اليوم",
        messages: [
          { from: "them", sender: "م. ليلى", text: "أرسل لي صور آخر تنفيذ من فضلك.", at: "09:10" },
        ],
      },
    ],
    supervisor: [
      {
        id: "T1",
        title: "صاحب المشروع — أحمد الشامي",
        subtitle: projectName,
        lastAt: "اليوم",
        messages: [
          { from: "them", sender: "صاحب المشروع", text: "هل اعتمدتَ المرحلة؟", at: "11:00" },
        ],
      },
      {
        id: "T2",
        title: "المقاول — شركة البناء المتقن",
        subtitle: projectName,
        unread: 1,
        lastAt: "اليوم",
        messages: [
          { from: "them", sender: "م. صلاح", text: "بانتظار توقيعك على التقرير.", at: "11:30" },
        ],
      },
      {
        id: "T3",
        title: "المهندس الميداني — م. سامي",
        subtitle: projectName,
        lastAt: "أمس",
        messages: [
          { from: "them", sender: "م. سامي", text: "رفعتُ صور التنفيذ.", at: "أمس" },
        ],
      },
    ],
    field: [
      {
        id: "T1",
        title: "المهندس المشرف — م. ليلى",
        subtitle: projectName,
        unread: 1,
        lastAt: "اليوم",
        messages: [
          { from: "them", sender: "م. ليلى", text: "وثّق ميول الصرف الصحي اليوم.", at: "08:45" },
        ],
      },
    ],
    admin: [
      {
        id: "T1",
        title: "نزاع #DSP-12 — فيلا الياسمين",
        subtitle: "وساطة بين الأطراف",
        unread: 3,
        lastAt: "قبل 10 دقائق",
        messages: [
          { from: "them", sender: "صاحب المشروع", text: "أعترض على جودة التنفيذ.", at: "09:30" },
          { from: "them", sender: "المقاول", text: "العمل مطابق للمواصفات.", at: "10:00" },
          { from: "me", sender: "إدارة تم", text: "سنُكلّف فريق فحص محايد.", at: "10:45" },
        ],
      },
      {
        id: "T2",
        title: "المقاول — شركة البناء المتقن",
        subtitle: "استفسار عن دفعة",
        lastAt: "أمس",
        messages: [
          { from: "them", sender: "م. صلاح", text: "متى يتم تحرير الدفعة؟", at: "أمس" },
        ],
      },
    ],
  };
  return base[role];
}
