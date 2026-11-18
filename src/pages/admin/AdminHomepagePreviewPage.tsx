import { ArrowLeft, Monitor, Smartphone, Tablet } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useCms } from "../../cms/CmsContext";
import { defaultHomepageSections } from "../../cms/defaultCmsData";
import { normalizeHomepageContent } from "../../cms/supabaseCmsRepository";
import type { HomepageContent } from "../../cms/types";
import { BagDrawer } from "../../components/BagReview";
import { Footer } from "../../components/Footer";
import { Header } from "../../components/Header";
import { BuyJourneyProvider } from "../../context/BuyJourneyContext";
import { HomePage } from "../HomePage";

export const HOMEPAGE_PREVIEW_SESSION_KEY_LEGACY = "buyandsell_admin_preview_legacy_v1";
export const HOMEPAGE_PREVIEW_SESSION_KEY_MODULAR = "buyandsell_admin_preview_modular_v1";

function readSessionPreview(key: string, layoutMode: "legacy" | "modular"): HomepageContent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<HomepageContent>;
    return normalizeHomepageContent({
      ...parsed,
      layoutMode,
      hasDraft: true,
    });
  } catch {
    return null;
  }
}

export function AdminHomepagePreviewPage() {
  const [searchParams] = useSearchParams();
  const { homepage, homepageDraft, homepageLegacyDraft } = useCms();

  const requestedMode = searchParams.get("mode") === "modular" ? "modular" : "legacy";
  const isEmbedded = searchParams.get("embedded") === "1";

  const [sessionSnapshot, setSessionSnapshot] = useState<HomepageContent | null>(() =>
    readSessionPreview(
      requestedMode === "modular"
        ? HOMEPAGE_PREVIEW_SESSION_KEY_MODULAR
        : HOMEPAGE_PREVIEW_SESSION_KEY_LEGACY,
      requestedMode
    )
  );
  const [viewportWidth, setViewportWidth] = useState<"full" | 1440 | 1024 | 834 | 390 | 375>("full");

  useEffect(() => {
    const key =
      requestedMode === "modular"
        ? HOMEPAGE_PREVIEW_SESSION_KEY_MODULAR
        : HOMEPAGE_PREVIEW_SESSION_KEY_LEGACY;
    const syncFromStorage = () => {
      setSessionSnapshot(readSessionPreview(key, requestedMode));
    };
    syncFromStorage();
    window.addEventListener("storage", syncFromStorage);
    return () => window.removeEventListener("storage", syncFromStorage);
  }, [requestedMode]);

  const savedDraft = requestedMode === "modular" ? homepageDraft : homepageLegacyDraft;
  const previewContent: HomepageContent =
    savedDraft ||
    sessionSnapshot ||
    (requestedMode === "modular"
      ? {
          ...homepage,
          layoutMode: "modular",
          sections:
            homepage.sections && homepage.sections.length > 0
              ? homepage.sections
              : defaultHomepageSections,
        }
      : {
          ...homepage,
          layoutMode: "legacy",
        });

  const storefrontTree = (
    <BuyJourneyProvider>
      <div className="public-shell min-h-screen bg-page text-ink">
        <Header />
        <BagDrawer />
        <main className="public-main">
          <HomePage overrideContent={previewContent} isAdminDraftPreview />
        </main>
        <Footer />
      </div>
    </BuyJourneyProvider>
  );

  if (isEmbedded) {
    return storefrontTree;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <div
        className="sticky top-0 z-50 bg-[#0a0a0c] text-white border-b border-[#d4af37]/30 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3"
        data-testid="admin-homepage-preview-bar"
      >
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/admin/homepage"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition"
          >
            <ArrowLeft size={14} />
            <span>Back to Editor</span>
          </Link>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#d4af37]/20 text-[#f0cf78] border border-[#d4af37]/40">
            {savedDraft
              ? `Saved ${requestedMode === "modular" ? "Modular" : "Legacy"} Draft Preview`
              : `${requestedMode === "modular" ? "Modular" : "Legacy"} Layout Preview`}
          </span>
          <span className="text-xs text-slate-300 hidden sm:inline">
            Public live storefront remains unchanged until published.
          </span>
        </div>

        <div className="inline-flex flex-wrap items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10">
          {(
            [
              { id: "full", label: "Full Width", Icon: Monitor },
              { id: 1440, label: "1440px", Icon: Monitor },
              { id: 1024, label: "1024px", Icon: Monitor },
              { id: 834, label: "834px", Icon: Tablet },
              { id: 390, label: "390px", Icon: Smartphone },
              { id: 375, label: "375px", Icon: Smartphone },
            ] as const
          ).map(({ id, label, Icon }) => (
            <button
              key={String(id)}
              type="button"
              onClick={() => setViewportWidth(id)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                viewportWidth === id
                  ? "bg-[#d4af37] text-[#0a0a0c]"
                  : "text-slate-200 hover:bg-white/10"
              }`}
            >
              <Icon size={12} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {viewportWidth === "full" ? (
        <div className="flex-1 bg-white">{storefrontTree}</div>
      ) : (
        <div className="flex-1 overflow-auto p-4 sm:p-6 flex justify-center bg-slate-900">
          <iframe
            title="Buy & Sell GH Responsive Draft Preview"
            src={`/admin/homepage-preview?mode=${requestedMode}&embedded=1${
              typeof window !== "undefined" &&
              (window.location.hostname === "localhost" ||
                window.location.hostname === "127.0.0.1")
                ? "&admin_preview=1"
                : ""
            }`}
            style={{ width: `${viewportWidth}px`, maxWidth: "100%", height: "calc(100vh - 88px)" }}
            className="bg-white rounded-xl border border-slate-700 shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
