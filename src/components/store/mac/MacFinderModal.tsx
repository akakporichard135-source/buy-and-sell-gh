import { ArrowLeft, Check, ChevronRight, MessageCircle, RotateCcw, ShoppingBag, Sparkles, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { Product } from "../../../types/product";
import { getPublicPurchaseAction } from "../../../catalog/productPurchaseAction";
import { resolveCatalogueProductImage, resolveProductImage } from "../../../utils/productImages";
import { getCardPriceDisplay } from "../../../utils/productPricing";
import { whatsappUrl } from "../../../utils/whatsapp";
import { localCatalogueImageBySlug } from "../../../utils/catalogueProductImages";

interface MacFinderModalProps {
  open: boolean;
  onClose: () => void;
  macProducts: Product[];
}

type UseCase = "everyday" | "creative" | "pro-dev" | "desktop";
type Mobility = "ultra-light" | "balanced" | "desk";
type BudgetBand = "under-16k" | "16k-26k" | "26k-plus" | "any";

const USE_CASES: { id: UseCase; title: string; subtitle: string }[] = [
  {
    id: "everyday",
    title: "Study, Business & Everyday",
    subtitle: "Browsing, Office/Docs, Zoom calls, finance, and university coursework.",
  },
  {
    id: "creative",
    title: "Design, Photo & Video Editing",
    subtitle: "Figma, Photoshop, Premiere, Final Cut, DaVinci Resolve, and music production.",
  },
  {
    id: "pro-dev",
    title: "Software Engineering & Heavy Pro Work",
    subtitle: "Docker, Xcode, 3D rendering, large codebases, and multi-monitor workflows.",
  },
  {
    id: "desktop",
    title: "Dedicated Home or Office Desk",
    subtitle: "Compact desktop power paired with your own external monitor, keyboard, and mouse.",
  },
];

const MOBILITY_OPTIONS: { id: Mobility; title: string; subtitle: string }[] = [
  {
    id: "ultra-light",
    title: "Ultra-Portable (13-inch)",
    subtitle: "Lightest to carry across Accra, campus, flights, and client meetings.",
  },
  {
    id: "balanced",
    title: "Bigger Screen (14” – 16”)",
    subtitle: "Roomy display for side-by-side windows, timelines, and spreadsheets.",
  },
  {
    id: "desk",
    title: "Stays on My Desk",
    subtitle: "Compact Mac mini or flagship workstation anchored to a desk setup.",
  },
];

const BUDGET_OPTIONS: { id: BudgetBand; title: string; subtitle: string }[] = [
  {
    id: "under-16k",
    title: "Under GH₵ 16,000",
    subtitle: "Best value MacBook Neo & M1/M2/M3 MacBook Air picks.",
  },
  {
    id: "16k-26k",
    title: "GH₵ 16,000 – GH₵ 26,000",
    subtitle: "Latest MacBook Air M4/M5 and MacBook Pro 14-inch M4.",
  },
  {
    id: "26k-plus",
    title: "GH₵ 26,000+ (Flagship Pro)",
    subtitle: "MacBook Pro M4 Pro / M5 Pro / M5 Max workstations.",
  },
  {
    id: "any",
    title: "Flexible / Pay Small-Small",
    subtitle: "Show the best overall match with Trade-In or installment options.",
  },
];

function resolveSafeMacImage(product: Product): string {
  const resolved = resolveCatalogueProductImage(product) || resolveProductImage(product);
  return (
    resolved?.src ||
    localCatalogueImageBySlug[product.slug] ||
    localCatalogueImageBySlug[product.id] ||
    "/products/mac-redesign/lineup-macbook-air-13.webp"
  );
}

export function MacFinderModal({ open, onClose, macProducts }: MacFinderModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [useCase, setUseCase] = useState<UseCase | null>(null);
  const [mobility, setMobility] = useState<Mobility | null>(null);
  const [budget, setBudget] = useState<BudgetBand | null>(null);

  const recommendations = useMemo(() => {
    if (!useCase) return [];
    const scored = macProducts.map((p) => {
      let score = 0;
      const slug = (p.slug || "").toLowerCase();
      const name = (p.name || "").toLowerCase();
      const isNeo = slug.includes("neo") || name.includes("neo");
      const isAir = slug.includes("air") || name.includes("air");
      const isPro = slug.includes("pro") || name.includes("pro");
      const isMini = slug.includes("mini") || name.includes("mini");
      const is13 = slug.includes("13") || isNeo;
      const is15or16 = slug.includes("15") || slug.includes("16");
      const is14 = slug.includes("14");
      const price = p.price || 0;

      if (p.stockStatus === "In Stock" && !p.priceOnRequest) score += 28;
      else if (p.stockStatus === "In Stock") score += 12;
      if (p.condition === "Brand New") score += 10;

      if (useCase === "everyday") {
        if (isNeo || isAir) score += 30;
        if (isPro) score += 8;
      } else if (useCase === "creative") {
        if (isPro) score += 32;
        if (isAir && (slug.includes("15") || slug.includes("m4") || slug.includes("m5"))) score += 22;
      } else if (useCase === "pro-dev") {
        if (isPro && (slug.includes("m4") || slug.includes("m5"))) score += 38;
        else if (isPro) score += 22;
      } else if (useCase === "desktop") {
        if (isMini) score += 45;
        if (isPro && is15or16) score += 15;
      }

      if (mobility === "ultra-light") {
        if (is13) score += 22;
        if (is14) score += 12;
      } else if (mobility === "balanced") {
        if (is14 || is15or16) score += 24;
      } else if (mobility === "desk") {
        if (isMini) score += 30;
        if (is15or16) score += 18;
      }

      if (budget === "under-16k") {
        if (price > 0 && price <= 16500) score += 34;
        else if (price > 16500 && price <= 19000) score += 10;
        else score -= 12;
      } else if (budget === "16k-26k") {
        if (price >= 16000 && price <= 26500) score += 34;
        else score += 4;
      } else if (budget === "26k-plus") {
        if (price >= 24000) score += 32;
      }

      return { product: p, score };
    });

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((entry) => entry.product);
  }, [macProducts, useCase, mobility, budget]);

  if (!open) return null;

  const reset = () => {
    setStep(1);
    setUseCase(null);
    setMobility(null);
    setBudget(null);
  };

  const whatsappSummary = whatsappUrl(
    `Hello Buy & Sell GH, I used the Mac Finder on your website (Use: ${useCase || "General"}, Portability: ${mobility || "Any"}, Budget: ${budget || "Flexible"}). Please help me confirm the best available Mac in Accra.`
  );

  return (
    <div
      className="mac-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mac-finder-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="mac-modal-card" data-testid="mac-finder-modal">
        <button
          type="button"
          className="mac-modal-close"
          onClick={onClose}
          aria-label="Close Help Me Choose"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8f650e] mb-2">
          <Sparkles size={14} className="text-[#d8a72d]" />
          <span>Buy &amp; Sell GH Mac Finder</span>
          {step <= 3 && <span className="text-[#86868b]">• Step {step} of 3</span>}
        </div>

        {step === 1 && (
          <div>
            <h3 id="mac-finder-title" className="text-2xl font-semibold tracking-tight text-[#1d1d1f] mb-2">
              What will you mainly do on your Mac?
            </h3>
            <p className="text-sm text-[#6e6e73] mb-6">
              Choose the option closest to your daily work so we match the right Apple silicon chip.
            </p>
            <div className="grid grid-cols-1 gap-3">
              {USE_CASES.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setUseCase(opt.id);
                    setStep(2);
                  }}
                  className="text-left p-4 rounded-2xl border border-[#d2d2d7] hover:border-[#d8a72d] hover:bg-[#fffaf0] transition flex items-center justify-between gap-4 cursor-pointer bg-white"
                >
                  <div>
                    <div className="font-semibold text-[15px] text-[#1d1d1f]">{opt.title}</div>
                    <div className="text-xs text-[#6e6e73] mt-0.5">{opt.subtitle}</div>
                  </div>
                  <ChevronRight size={18} className="text-[#86868b] shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 id="mac-finder-title" className="text-2xl font-semibold tracking-tight text-[#1d1d1f] mb-2">
              How portable does your Mac need to be?
            </h3>
            <p className="text-sm text-[#6e6e73] mb-6">
              Pick the screen size or desktop style that fits how you work.
            </p>
            <div className="grid grid-cols-1 gap-3">
              {MOBILITY_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setMobility(opt.id);
                    setStep(3);
                  }}
                  className="text-left p-4 rounded-2xl border border-[#d2d2d7] hover:border-[#d8a72d] hover:bg-[#fffaf0] transition flex items-center justify-between gap-4 cursor-pointer bg-white"
                >
                  <div>
                    <div className="font-semibold text-[15px] text-[#1d1d1f]">{opt.title}</div>
                    <div className="text-xs text-[#6e6e73] mt-0.5">{opt.subtitle}</div>
                  </div>
                  <ChevronRight size={18} className="text-[#86868b] shrink-0" />
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[#8f650e] hover:underline bg-transparent border-0 cursor-pointer"
            >
              <ArrowLeft size={15} /> Back
            </button>
          </div>
        )}

        {step === 3 && (
          <div>
            <h3 id="mac-finder-title" className="text-2xl font-semibold tracking-tight text-[#1d1d1f] mb-2">
              What is your target budget in GH₵?
            </h3>
            <p className="text-sm text-[#6e6e73] mb-6">
              We match against live Buy &amp; Sell GH inventory and real GH₵ pricing.
            </p>
            <div className="grid grid-cols-1 gap-3">
              {BUDGET_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setBudget(opt.id);
                    setStep(4);
                  }}
                  className="text-left p-4 rounded-2xl border border-[#d2d2d7] hover:border-[#d8a72d] hover:bg-[#fffaf0] transition flex items-center justify-between gap-4 cursor-pointer bg-white"
                >
                  <div>
                    <div className="font-semibold text-[15px] text-[#1d1d1f]">{opt.title}</div>
                    <div className="text-xs text-[#6e6e73] mt-0.5">{opt.subtitle}</div>
                  </div>
                  <ChevronRight size={18} className="text-[#86868b] shrink-0" />
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[#8f650e] hover:underline bg-transparent border-0 cursor-pointer"
            >
              <ArrowLeft size={15} /> Back
            </button>
          </div>
        )}

        {step === 4 && (
          <div>
            <h3 id="mac-finder-title" className="text-2xl font-semibold tracking-tight text-[#1d1d1f] mb-1">
              Recommended Macs for you
            </h3>
            <p className="text-sm text-[#6e6e73] mb-5">
              Matched from our real Buy &amp; Sell GH Accra catalogue with live GH₵ pricing.
            </p>

            <div className="space-y-3">
              {recommendations.map((prod, idx) => {
                const price = getCardPriceDisplay(prod);
                const action = getPublicPurchaseAction(prod);
                const buyUrl = `/shop/buy-mac/${prod.slug}`;
                const imgSrc = resolveSafeMacImage(prod);
                return (
                  <div
                    key={prod.id}
                    className="p-4 rounded-2xl border border-[#e5e5ea] bg-[#f5f5f7]/55 flex flex-col sm:flex-row items-center gap-4"
                  >
                    <div className="w-24 h-20 rounded-xl bg-white border border-[#e8e8ed] flex items-center justify-center p-2 shrink-0">
                      <img
                        src={imgSrc}
                        alt={prod.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                        {idx === 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#1d1d1f] text-white text-[10.5px] font-semibold">
                            <Check size={11} /> Top Match
                          </span>
                        )}
                        {prod.condition && prod.condition !== "To Confirm" && (
                          <span className="px-2 py-0.5 rounded-full bg-white border border-[#d2d2d7] text-[#424245] text-[10.5px] font-semibold">
                            {prod.condition}
                          </span>
                        )}
                      </div>
                      <div className="font-semibold text-base text-[#1d1d1f]">{prod.name}</div>
                      <div className="text-sm font-semibold text-[#1d1d1f] mt-0.5">{price.current}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {action === "enquire" ? (
                        <a
                          href={whatsappUrl(`Hello Buy & Sell GH, I'd like to confirm pricing for ${prod.name}.`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mac-btn-gold-pill text-xs px-4 h-9"
                        >
                          <ShoppingBag size={14} strokeWidth={2.2} aria-hidden="true" />
                          <span>Enquire</span>
                        </a>
                      ) : (
                        <Link
                          to={buyUrl}
                          onClick={onClose}
                          className="mac-btn-gold-pill text-xs px-4 h-9"
                        >
                          <ShoppingBag size={14} strokeWidth={2.2} aria-hidden="true" />
                          <span>{action === "buy" ? "Buy" : "View Pricing"}</span>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-[#e8e8ed] flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6e6e73] hover:text-[#1d1d1f] bg-transparent border-0 cursor-pointer"
              >
                <RotateCcw size={14} /> Start over
              </button>
              <a
                href={whatsappSummary}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-semibold no-underline"
              >
                <MessageCircle size={15} />
                Ask our Accra team on WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
