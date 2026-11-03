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

      // 1. Check Product Exclusions
      if (promo.excludedProductIds && promo.excludedProductIds.length > 0) {
        if (promo.excludedProductIds.includes(product.id) || promo.excludedProductIds.includes(product.slug)) {
          continue;
        }
      }

      // 2. Check Category Exclusions
      if (promo.excludedCategories && promo.excludedCategories.length > 0) {
        const itemCat = (product.category || "").toLowerCase();
        if (promo.excludedCategories.some((c) => c.toLowerCase() === itemCat)) {
          continue;
        }
      }

      // 3. Price Checks (missing/unverified <= 0 receives NO automatic discounts)
      const effectivePrice = selectedVariant?.price ?? product.price;
      if (!effectivePrice || effectivePrice <= 0) continue;

      if (typeof promo.minQualifyingItemPrice === "number" && promo.minQualifyingItemPrice > 0) {
        if (effectivePrice < promo.minQualifyingItemPrice) continue;
      }

      // 4. Check product ID or slug
      if (promo.eligibleProductIds && promo.eligibleProductIds.length > 0) {
        const matchesId = promo.eligibleProductIds.includes(product.id);
        const matchesSlug = promo.eligibleProductIds.includes(product.slug);
        if (!matchesId && !matchesSlug) continue;
      }

      // 5. Check category if specified
      if (promo.eligibleCategory && promo.eligibleCategory !== "all") {
        if (product.category?.toLowerCase() !== promo.eligibleCategory.toLowerCase()) {
          continue;
        }
      }

      // 6. Check variant ID if configured
      if (promo.eligibleVariantIds && promo.eligibleVariantIds.length > 0) {
        if (!selectedVariant || !promo.eligibleVariantIds.includes(selectedVariant.id)) {
          continue;
        }
      }

      // 7. Check storage option if configured
      if (promo.eligibleStorageOptions && promo.eligibleStorageOptions.length > 0) {
        if (!selectedStorage || !promo.eligibleStorageOptions.includes(selectedStorage)) {
          continue;
        }
      }

      // 8. For free gifts, check gift stock
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

  const effectivePrice = selectedVariant?.price ?? product.price;

  let percentText = `${matchingPromo.discountPercent || 10}% Off at Checkout`;
  if (isPercent) {
    if (matchingPromo.productDiscounts && (matchingPromo.productDiscounts[product.id] || matchingPromo.productDiscounts[product.slug])) {
      const specific = matchingPromo.productDiscounts[product.id] ?? matchingPromo.productDiscounts[product.slug];
      percentText = `${specific}% Off at Checkout`;
    } else if (matchingPromo.discountTiers && matchingPromo.discountTiers.length > 0) {
      const matchingTier = [...matchingPromo.discountTiers]
        .sort((a, b) => b.minPrice - a.minPrice)
        .find((t) => effectivePrice >= t.minPrice && (!t.maxPrice || effectivePrice <= t.maxPrice));
      if (matchingTier) {
        percentText = `${matchingTier.percent}% Off at Checkout`;
      } else {
        percentText = `Up to ${matchingPromo.discountPercent || 15}% Off at Checkout`;
      }
    }
  }

  const badgeText = isGift
    ? `${matchingPromo.giftProductName || "Free Gift"} Included`
    : isPercent
    ? percentText
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
