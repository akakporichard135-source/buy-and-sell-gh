import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ShoppingBag, X } from "lucide-react";
import type { IphoneLineupCard } from "../../../cms/types";
import type { Product } from "../../../types/product";
import { getPublicPurchaseAction } from "../../../catalog/productPurchaseAction";
import { getCardPriceDisplay } from "../../../utils/productPricing";

interface IphoneCompareModalProps {
  open: boolean;
  onClose: () => void;
  cards: IphoneLineupCard[];
  productsBySlug: Map<string, Product>;
}

export function IphoneCompareModal({
  open,
  onClose,
  cards,
  productsBySlug,
}: IphoneCompareModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="iphone-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="iphone-compare-title"
      data-testid="iphone-compare-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="iphone-modal-dialog iphone-compare-dialog">
        <button
          type="button"
          className="iphone-modal-close"
          aria-label="Close iPhone comparison"
          onClick={onClose}
        >
          <X size={18} />
        </button>

        <p className="iphone-why-eyebrow" style={{ marginBottom: 4 }}>
          Buy &amp; Sell GH · Side-by-Side Comparison
        </p>
        <h2
          id="iphone-compare-title"
          style={{
            margin: "0 0 6px",
            fontSize: "clamp(24px, 3vw, 34px)",
            fontWeight: 700,
            letterSpacing: "-0.025em",
          }}
        >
          Compare iPhone models.
        </h2>
        <p style={{ margin: 0, fontSize: 14.5, color: "#6e6e73" }}>
          Real GH₵ pricing synced from Buy &amp; Sell GH Accra inventory.
        </p>

        <div className="iphone-compare-grid">
          {cards.map((card) => {
            const product = card.productSlug ? productsBySlug.get(card.productSlug) : undefined;
            const priceDisp = product ? getCardPriceDisplay(product) : null;
            const livePrice =
              priceDisp && !priceDisp.isEnquiry
                ? priceDisp.current
                : card.fallbackPriceText || "Confirm price";
            const action = product ? getPublicPurchaseAction(product) : "buy";
            const ctaText = action === "buy" ? card.buyLabel || "Buy" : "View Pricing";

            return (
              <article key={card.id} className="iphone-compare-col">
                <img src={card.image} alt={card.alt} loading="lazy" />
                {card.badge && (
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: "#bf4800", marginBottom: 4 }}>
                    {card.badge}
                  </span>
                )}
                <h3 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700 }}>{card.title}</h3>
                <p style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700 }}>{livePrice}</p>

                <Link
                  to={card.buyTo}
                  className="iphone-btn-gold-pill"
                  onClick={onClose}
                  style={{ width: "100%", minHeight: 38, fontSize: 13.5 }}
                >
                  <ShoppingBag size={14} aria-hidden="true" />
                  <span>{ctaText}</span>
                </Link>

                <ul className="iphone-compare-specs">
                  {card.chipLine && <li><strong>Chip:</strong> {card.chipLine}</li>}
                  {card.displaySpec && <li>{card.displaySpec}</li>}
                  {card.cameraSpec && <li>{card.cameraSpec}</li>}
                  {card.batterySpec && <li>{card.batterySpec}</li>}
                </ul>

                <Link
                  to={card.learnMoreTo}
                  className="iphone-link-gold"
                  style={{ marginTop: "auto", fontSize: 13.5 }}
                  onClick={onClose}
                >
                  <span>{card.learnMoreLabel}</span>
                  <ChevronRight size={14} aria-hidden="true" />
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
