import { Gift, Sparkles, Tag } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import type { Product, ProductVariant } from "../../types/product";
import type { PromotionCampaign } from "../../types/promotion";
import { isPromotionCurrentlyActive } from "../../promotions/promotionEngine";
import { formatGhs } from "../../utils/format";

interface ProductPromotionalBadgeProps {
  product: Product;
  selectedVariant?: ProductVariant;
  selectedStorage?: string;
  className?: string;
}

export function ProductPromotionalBadge({
  product,
  selectedVariant,
  selectedStorage,
  className = "",
}: ProductPromotionalBadgeProps) {
  const { promotions } = useCart();

  // Find all active promotions that match this product and variant configuration
  const matchingPromo = useMemo(() => {
    const active = promotions
      .filter((p) => isPromotionCurrentlyActive(p))
      .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

    for (const promo of active) {
      if (promo.promotionType === "advertising") continue;

      // 1. Check product ID or slug
      if (promo.eligibleProductIds && promo.eligibleProductIds.length > 0) {
        const matchesId = promo.eligibleProductIds.includes(product.id);
        const matchesSlug = promo.eligibleProductIds.includes(product.slug);
        if (!matchesId && !matchesSlug) continue;
      }

      // 2. Check category if specified
      if (promo.eligibleCategory && promo.eligibleCategory !== "all") {
        if (product.category?.toLowerCase() !== promo.eligibleCategory.toLowerCase()) {
          continue;
        }
      }

      // 3. Check variant ID if configured
      if (promo.eligibleVariantIds && promo.eligibleVariantIds.length > 0) {
        if (!selectedVariant || !promo.eligibleVariantIds.includes(selectedVariant.id)) {
          continue;
        }
      }

      // 4. Check storage option if configured
      if (promo.eligibleStorageOptions && promo.eligibleStorageOptions.length > 0) {
        if (!selectedStorage || !promo.eligibleStorageOptions.includes(selectedStorage)) {
          continue;
        }
      }

      // 5. For free gifts, check gift stock
      if (promo.promotionType === "free_gift" && (promo.giftStockQuantity ?? 0) <= 0) {
        continue;
      }

      return promo;
    }

    return null;
  }, [promotions, product, selectedVariant, selectedStorage]);

  if (!matchingPromo) return null;

  const isGift = matchingPromo.promotionType === "free_gift";
  const isPercent = matchingPromo.promotionType === "percentage_discount";
  const isFixed = matchingPromo.promotionType === "fixed_discount";

  const badgeText = isGift
    ? `${matchingPromo.giftProductName || "Free Case"} Included`
    : isPercent
    ? `${matchingPromo.discountPercent}% Off at Checkout`
    : isFixed
    ? `Save ${formatGhs(matchingPromo.discountAmount || 0)}`
    : "Special Offer";

  return (
    <aside
      className={`product-promotional-badge ${className}`}
      aria-label="Active promotion"
      style={{
        padding: "10px 14px",
        borderRadius: 12,
        background: isGift ? "#fef3c7" : "#f0fdf4",
        border: `1px solid ${isGift ? "#fde68a" : "#bbf7d0"}`,
        color: isGift ? "#92400e" : "#166534",
        fontSize: "0.85rem",
        lineHeight: 1.4,
        margin: "12px 0",
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        overflowWrap: "break-word",
        wordBreak: "normal",
      }}
    >
      <div style={{ marginTop: 2, flexShrink: 0 }}>
        {isGift ? <Gift size={16} /> : isFixed || isPercent ? <Tag size={16} /> : <Sparkles size={16} />}
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <span style={{ fontWeight: 700, letterSpacing: "-0.01em" }}>{badgeText}</span>
          <span style={{ fontSize: "0.74rem", opacity: 0.85 }}>({matchingPromo.title})</span>
        </div>
        <p style={{ margin: "2px 0 0", fontSize: "0.8rem", opacity: 0.9 }}>
          {isGift
            ? `Complimentary ${matchingPromo.giftProductName || "accessory"} is added to your bag at checkout automatically.`
            : matchingPromo.shortDescription}
        </p>
      </div>

      <Link
        to={`/offers#${matchingPromo.slug}`}
        style={{
          fontSize: "0.78rem",
          fontWeight: 600,
          color: isGift ? "#b45309" : "#15803d",
          textDecoration: "underline",
          whiteSpace: "nowrap",
          marginTop: 2,
        }}
      >
        Offer details
      </Link>
    </aside>
  );
}
