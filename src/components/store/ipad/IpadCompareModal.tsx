import { Check, Cpu, Keyboard, Monitor, PenTool, ShoppingBag, Sparkles, X } from "lucide-react";
import { Link } from "react-router-dom";
import type { IpadLineupCard } from "../../../cms/types";
import type { Product } from "../../../types/product";
import { getPublicPurchaseAction } from "../../../catalog/productPurchaseAction";
import { getCardPriceDisplay } from "../../../utils/productPricing";
import { whatsappUrl } from "../../../utils/whatsapp";

interface IpadCompareModalProps {
  open: boolean;
  onClose: () => void;
  cards: IpadLineupCard[];
  productBySlug: Map<string, Product>;
}

export function IpadCompareModal({
  open,
  onClose,
  cards,
  productBySlug,
}: IpadCompareModalProps) {
  if (!open) return null;

  return (
    <div
      className="ipad-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ipad-compare-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="ipad-modal-card is-wide" data-testid="ipad-compare-modal">
        <button
          type="button"
          className="ipad-modal-close"
          onClick={onClose}
          aria-label="Close Compare iPad models"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8f650e] mb-2">
          <Sparkles size={14} className="text-[#d8a72d]" />
          <span>Buy &amp; Sell GH iPad Comparison</span>
        </div>

        <h3
          id="ipad-compare-modal-title"
          className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f] mb-2"
        >
          Compare iPad models.
        </h3>
        <p className="text-sm text-[#6e6e73] mb-6">
          Side-by-side live GH₵ pricing, Apple silicon power, display quality, and accessory compatibility in Accra.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => {
            const liveProduct = card.productSlug
              ? productBySlug.get(card.productSlug.toLowerCase())
              : undefined;
            const livePrice = liveProduct
              ? getCardPriceDisplay(liveProduct).current
              : card.fallbackPriceText || "Price on Enquiry";
            const action = liveProduct ? getPublicPurchaseAction(liveProduct) : "buy";
            const buyText =
              liveProduct && action === "enquire"
                ? "Enquire"
                : liveProduct && action === "view-pricing"
                ? "View Pricing"
                : card.buyLabel || "Buy";
            const buyDest =
              liveProduct && action === "enquire"
                ? whatsappUrl(`Hello Buy & Sell GH, I would like to enquire about ${liveProduct.name}.`)
                : liveProduct
                ? `/shop/buy-ipad/${liveProduct.slug}`
                : card.buyTo;

            return (
              <article
                key={card.id}
                className="rounded-2xl border border-[#e8e8ed] bg-[#f5f5f7]/60 p-4 flex flex-col text-center"
              >
                <div
                  className={`h-36 rounded-2xl overflow-hidden mb-3 flex items-center justify-center ${
                    card.tileTone === "dark"
                      ? "bg-[#0a0a0c]"
                      : card.tileTone === "sky"
                      ? "bg-[#d6ecfa]"
                      : "bg-[#efeff3]"
                  }`}
                >
                  <img
                    src={card.image}
                    alt={card.alt || card.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {card.badge ? (
                  <div className="text-[11px] font-semibold text-[#bf4800] mb-0.5">{card.badge}</div>
                ) : (
                  <div className="text-[11px] mb-0.5">&nbsp;</div>
                )}

                <h4 className="text-lg font-semibold text-[#1d1d1f]">{card.title}</h4>
                <div className="text-sm font-semibold text-[#1d1d1f] mt-1 mb-3">{livePrice}</div>

                <div className="space-y-2.5 text-left text-xs text-[#424245] border-t border-[#e5e5ea] pt-3 mb-4 flex-1">
                  {card.displaySpec && (
                    <div className="flex items-start gap-2">
                      <Monitor size={14} className="text-[#8f650e] shrink-0 mt-0.5" />
                      <span>{card.displaySpec}</span>
                    </div>
                  )}
                  {card.chipLine && (
                    <div className="flex items-start gap-2">
                      <Cpu size={14} className="text-[#8f650e] shrink-0 mt-0.5" />
                      <span>{card.chipLine}</span>
                    </div>
                  )}
                  {card.pencilSupport && (
                    <div className="flex items-start gap-2">
                      <PenTool size={14} className="text-[#8f650e] shrink-0 mt-0.5" />
                      <span>{card.pencilSupport}</span>
                    </div>
                  )}
                  {card.keyboardSupport && (
                    <div className="flex items-start gap-2">
                      <Keyboard size={14} className="text-[#8f650e] shrink-0 mt-0.5" />
                      <span>{card.keyboardSupport}</span>
                    </div>
                  )}
                  {liveProduct?.stockStatus && (
                    <div className="flex items-start gap-2">
                      <Check size={14} className="text-[#16a34a] shrink-0 mt-0.5" />
                      <span>{liveProduct.stockStatus}</span>
                    </div>
                  )}
                </div>

                {liveProduct && action === "enquire" ? (
                  <a
                    href={buyDest}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ipad-btn-gold-pill w-full text-xs h-9"
                  >
                    <ShoppingBag size={14} strokeWidth={2.2} aria-hidden="true" />
                    <span>{buyText}</span>
                  </a>
                ) : (
                  <Link
                    to={buyDest}
                    onClick={onClose}
                    className="ipad-btn-gold-pill w-full text-xs h-9"
                  >
                    <ShoppingBag size={14} strokeWidth={2.2} aria-hidden="true" />
                    <span>{buyText}</span>
                  </Link>
                )}
              </article>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-[#e8e8ed] flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/shop/buy-ipad"
            onClick={onClose}
            className="ipad-link-action text-sm"
          >
            <ShoppingBag size={15} className="ipad-gold-bag-icon" aria-hidden="true" />
            <span>Browse all 19 iPad listings in Accra ›</span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-medium text-[#6e6e73] hover:text-[#1d1d1f] bg-transparent border-0 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
