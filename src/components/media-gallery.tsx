import { useEffect, useState, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Play, Images } from "lucide-react";
import panelImg from "@/assets/gallery-panel.jpg";
import batteryImg from "@/assets/gallery-battery.jpg";
import inverterImg from "@/assets/gallery-inverter.jpg";
import systemImg from "@/assets/gallery-system.jpg";

export type MediaItem =
  | { kind: "image"; src: string; thumb?: string; title: string }
  | { kind: "video"; src: string; poster: string; title: string };

export const defaultSolarMedia: MediaItem[] = [
  { kind: "image", src: panelImg, title: "اللوح الشمسي 650W" },
  { kind: "image", src: batteryImg, title: "بطارية ليثيوم LiFePO4" },
  { kind: "image", src: inverterImg, title: "الإنفرتر الهجين" },
  { kind: "image", src: systemImg, title: "تركيب كامل على السطح" },
  {
    kind: "video",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    poster: systemImg,
    title: "جولة في تركيب حقيقي",
  },
];

export function MediaGallery({
  items = defaultSolarMedia,
  title = "معرض الصور والفيديو",
}: {
  items?: MediaItem[];
  title?: string;
}) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [zoomed, setZoomed] = useState(false);

  const close = useCallback(() => {
    setOpenIdx(null);
    setZoomed(false);
  }, []);

  const next = useCallback(() => {
    setOpenIdx((i) => (i === null ? null : (i + 1) % items.length));
    setZoomed(false);
  }, [items.length]);

  const prev = useCallback(() => {
    setOpenIdx((i) => (i === null ? null : (i - 1 + items.length) % items.length));
    setZoomed(false);
  }, [items.length]);

  useEffect(() => {
    if (openIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") prev(); // RTL: right = previous
      if (e.key === "ArrowLeft") next();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [openIdx, close, next, prev]);

  const current = openIdx !== null ? items[openIdx] : null;

  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-card md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-ink">{title}</h2>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <Images className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3">
        {items.map((it, i) => {
          const thumbSrc = it.kind === "image" ? it.src : it.poster;
          return (
            <button
              key={i}
              type="button"
              onClick={() => {
                setOpenIdx(i);
                setZoomed(false);
              }}
              className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-muted transition hover:shadow-elevated focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label={`فتح ${it.title}`}
            >
              <img
                src={thumbSrc}
                alt={it.title}
                loading="lazy"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 px-3 py-2 text-[11px] font-bold text-white">
                <span className="truncate">{it.title}</span>
                {it.kind === "video" ? (
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/90 text-primary">
                    <Play className="h-3 w-3 fill-current" />
                  </span>
                ) : (
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/90 text-primary">
                    <ZoomIn className="h-3 w-3" />
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {current ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={close}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              close();
            }}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            aria-label="إغلاق"
          >
            <X className="h-5 w-5" />
          </button>

          {current.kind === "image" ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setZoomed((z) => !z);
              }}
              className="absolute right-16 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              aria-label={zoomed ? "تصغير" : "تكبير"}
            >
              {zoomed ? <ZoomOut className="h-5 w-5" /> : <ZoomIn className="h-5 w-5" />}
            </button>
          ) : null}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute right-2 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 md:right-6"
            aria-label="السابق"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute left-2 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 md:left-6"
            aria-label="التالي"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <div
            className="relative flex max-h-[90vh] w-full max-w-6xl items-center justify-center overflow-auto px-4"
            onClick={(e) => e.stopPropagation()}
          >
            {current.kind === "image" ? (
              <img
                src={current.src}
                alt={current.title}
                onClick={() => setZoomed((z) => !z)}
                className={`select-none rounded-xl shadow-2xl transition-transform duration-300 ${
                  zoomed
                    ? "max-w-none cursor-zoom-out scale-150"
                    : "max-h-[85vh] max-w-full cursor-zoom-in object-contain"
                }`}
              />
            ) : (
              <video
                src={current.src}
                poster={current.poster}
                controls
                autoPlay
                className="max-h-[85vh] max-w-full rounded-xl shadow-2xl"
              />
            )}
          </div>

          <div className="absolute inset-x-0 bottom-4 z-10 flex flex-col items-center gap-2 px-4 text-center">
            <div className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-bold text-white">
              {current.title}
            </div>
            <div className="text-xs text-white/70">
              {(openIdx ?? 0) + 1} / {items.length}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
