import { getSupabaseOrThrow, supabase } from "../lib/supabase";
import { assertAdminAal2, isLocalAdminActive } from "../admin/adminAuthorization";
import { defaultPromotions } from "./defaultPromotions";
import type { PromotionCampaign, PromotionStatus } from "../types/promotion";

const PROMOTIONS_STORAGE_KEY = "buyandsell_promotions_cache_v1";

// Cache listeners for reactive UI across components
type PromotionsListener = () => void;
const listeners: Set<PromotionsListener> = new Set();
let realtimeChannel: any = null;

export const subscribeToPromotions = (listener: PromotionsListener) => {
  listeners.add(listener);

  // Set up Supabase Realtime listener to broadcast changes across all tabs and devices
  if (!realtimeChannel && supabase) {
    try {
      realtimeChannel = supabase
        .channel("promotions-realtime-sync")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "promotions" },
          () => {
            void fetchPromotions(false).then(() => {
              notifyListeners();
            });
          }
        )
        .subscribe();
    } catch {
      // Non-blocking fallback
    }
  }

  return () => {
    listeners.delete(listener);
  };
};

const notifyListeners = () => {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch {
      // ignore
    }
  });
};

const readLocalPromotions = (): PromotionCampaign[] => {
  try {
    const raw = localStorage.getItem(PROMOTIONS_STORAGE_KEY);
    if (!raw) return defaultPromotions;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultPromotions;
  } catch {
    return defaultPromotions;
  }
};

const writeLocalPromotions = (promos: PromotionCampaign[]) => {
  try {
    localStorage.setItem(PROMOTIONS_STORAGE_KEY, JSON.stringify(promos));
  } catch {
    // ignore
  }
};

// Map Supabase snake_case row to camelCase PromotionCampaign
function mapRowToCampaign(row: any): PromotionCampaign {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    shortDescription: row.short_description || "",
    detailedDescription: row.detailed_description || "",
    promotionType: row.promotion_type,
    status: row.status,
    isEnabled: row.is_enabled !== false,
    startDate: row.start_date,
    endDate: row.end_date,
    timezone: row.timezone || "Africa/Accra",
    priority: row.priority ?? 0,
    allowStacking: Boolean(row.allow_stacking),
    eligibleProductIds: Array.isArray(row.eligible_product_ids) ? row.eligible_product_ids : [],
    eligibleCategory: row.eligible_category || "all",
    eligibleVariantIds: Array.isArray(row.eligible_variant_ids) ? row.eligible_variant_ids : [],
    eligibleStorageOptions: Array.isArray(row.eligible_storage_options) ? row.eligible_storage_options : [],
    minOrderSubtotal: Number(row.min_order_subtotal ?? 0),
    discountPercent: row.discount_percent !== null ? Number(row.discount_percent) : null,
    discountAmount: row.discount_amount !== null ? Number(row.discount_amount) : null,
    promotionalPrice: row.promotional_price !== null ? Number(row.promotional_price) : null,
    giftProductId: row.gift_product_id,
    giftProductName: row.gift_product_name,
    giftProductSlug: row.gift_product_slug,
    giftProductImage: row.gift_product_image,
    giftQuantityPerPurchase: row.gift_quantity_per_purchase ?? 1,
    maxGiftsPerOrder: row.max_gifts_per_order ?? 1,
    giftStockQuantity: row.gift_stock_quantity ?? 0,
    giftStockAlertThreshold: row.gift_stock_alert_threshold ?? 5,
    bundleRequiredProductIds: Array.isArray(row.bundle_required_product_ids) ? row.bundle_required_product_ids : [],
    bundleDiscountAmount: row.bundle_discount_amount !== null ? Number(row.bundle_discount_amount) : null,
    bundleDiscountPercent: row.bundle_discount_percent !== null ? Number(row.bundle_discount_percent) : null,
    desktopFlyerUrl: row.desktop_flyer_url || "",
    mobileFlyerUrl: row.mobile_flyer_url || "",
    flyerAltText: row.flyer_alt_text || "",
    ctaText: row.cta_text || "View Offer",
    ctaDestination: row.cta_destination || "/offers",
    displayOrder: row.display_order ?? 0,
    showOnAnnouncementBar: Boolean(row.show_on_announcement_bar),
    announcementBarText: row.announcement_bar_text || "",
    showOnHomepageCarousel: row.show_on_homepage_carousel !== false,
    showOnOffersPage: row.show_on_offers_page !== false,
    totalRedemptionLimit: row.total_redemption_limit !== null ? Number(row.total_redemption_limit) : null,
    currentRedemptions: row.current_redemptions ?? 0,
    customerRedemptionLimit: row.customer_redemption_limit ?? 1,
    viewCount: row.view_count ?? 0,
    clickCount: row.click_count ?? 0,
    ordersCount: row.orders_count ?? 0,
    totalDiscountGiven: Number(row.total_discount_given ?? 0),
    totalGiftsAllocated: row.total_gifts_allocated ?? 0,
    totalAttributedSales: Number(row.total_attributed_sales ?? 0),
    createdBy: row.created_by,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

// Map camelCase PromotionCampaign to Supabase snake_case row
function mapCampaignToRow(c: Partial<PromotionCampaign>) {
  return {
    id: c.id,
    slug: c.slug,
    title: c.title,
    short_description: c.shortDescription ?? "",
    detailed_description: c.detailedDescription ?? "",
    promotion_type: c.promotionType,
    status: c.status,
    is_enabled: c.isEnabled !== false,
    start_date: c.startDate || null,
    end_date: c.endDate || null,
    timezone: c.timezone || "Africa/Accra",
    priority: c.priority ?? 0,
    allow_stacking: Boolean(c.allowStacking),
    eligible_product_ids: c.eligibleProductIds ?? [],
    eligible_category: c.eligibleCategory ?? "all",
    eligible_variant_ids: c.eligibleVariantIds ?? [],
    eligible_storage_options: c.eligibleStorageOptions ?? [],
    min_order_subtotal: c.minOrderSubtotal ?? 0,
    discount_percent: c.discountPercent ?? null,
    discount_amount: c.discountAmount ?? null,
    promotional_price: c.promotionalPrice ?? null,
    gift_product_id: c.giftProductId ?? null,
    gift_product_name: c.giftProductName ?? null,
    gift_product_slug: c.giftProductSlug ?? null,
    gift_product_image: c.giftProductImage ?? null,
    gift_quantity_per_purchase: c.giftQuantityPerPurchase ?? 1,
    max_gifts_per_order: c.maxGiftsPerOrder ?? 1,
    gift_stock_quantity: c.giftStockQuantity ?? 0,
    gift_stock_alert_threshold: c.giftStockAlertThreshold ?? 5,
    bundle_required_product_ids: c.bundleRequiredProductIds ?? [],
    bundle_discount_amount: c.bundleDiscountAmount ?? null,
    bundle_discount_percent: c.bundleDiscountPercent ?? null,
    desktop_flyer_url: c.desktopFlyerUrl ?? "",
    mobile_flyer_url: c.mobileFlyerUrl ?? "",
    flyer_alt_text: c.flyerAltText ?? "",
    cta_text: c.ctaText ?? "View Offer",
    cta_destination: c.ctaDestination ?? "/offers",
    display_order: c.displayOrder ?? 0,
    show_on_announcement_bar: Boolean(c.showOnAnnouncementBar),
    announcement_bar_text: c.announcementBarText ?? "",
    show_on_homepage_carousel: c.showOnHomepageCarousel !== false,
    show_on_offers_page: c.showOnOffersPage !== false,
    total_redemption_limit: c.totalRedemptionLimit ?? null,
    customer_redemption_limit: c.customerRedemptionLimit ?? 1,
    updated_at: new Date().toISOString(),
  };
}

export const fetchPromotions = async (includeAll = false): Promise<PromotionCampaign[]> => {
  if (!supabase) return readLocalPromotions();

  try {
    let query = supabase.from("promotions").select("*").order("display_order", { ascending: true });

    if (!includeAll) {
      query = query.eq("is_enabled", true).eq("status", "active");
    }

    const { data, error } = await query;
    if (!error && Array.isArray(data)) {
      const now = new Date();
      const mapped = data
        .map(mapRowToCampaign)
        .filter((c) => {
          if (includeAll) return true;
          if (!c.isEnabled || c.status !== "active") return false;
          if (c.startDate && new Date(c.startDate) > now) return false;
          if (c.endDate && new Date(c.endDate) < now) return false;
          return true;
        });

      writeLocalPromotions(mapped);
      return mapped;
    }
    if (error) {
      console.warn("[PromotionsRepository] Supabase fetch error:", error.message);
    }
  } catch (err: any) {
    console.warn("[PromotionsRepository] Network error:", err?.message);
  }

  return readLocalPromotions();
};

export const savePromotion = async (campaign: Partial<PromotionCampaign>): Promise<PromotionCampaign> => {
  await assertAdminAal2();
  const client = getSupabaseOrThrow();

  const id = campaign.id || `promo-${Date.now()}`;
  const slug = campaign.slug || campaign.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || id;

  const toSave: Partial<PromotionCampaign> = {
    ...campaign,
    id,
    slug,
  };

  const payload = mapCampaignToRow(toSave);

  const { data, error } = await client
    .from("promotions")
    .upsert(payload)
    .select()
    .single();

  if (error) {
    if (isLocalAdminActive()) {
      const current = readLocalPromotions();
      const existingIndex = current.findIndex((c) => c.id === id);
      const updatedCampaign: PromotionCampaign = {
        ...(existingIndex >= 0 ? current[existingIndex] : defaultPromotions[0]),
        ...toSave,
        id,
        slug,
        updatedAt: new Date().toISOString(),
      } as PromotionCampaign;

      if (existingIndex >= 0) {
        current[existingIndex] = updatedCampaign;
      } else {
        current.push(updatedCampaign);
      }
      writeLocalPromotions(current);
      notifyListeners();
      return updatedCampaign;
    }
    throw new Error(`Database error saving promotion: ${error.message}`);
  }

  const result = mapRowToCampaign(data);
  const current = readLocalPromotions();
  const index = current.findIndex((c) => c.id === result.id);
  if (index >= 0) current[index] = result;
  else current.push(result);
  writeLocalPromotions(current);
  notifyListeners();
  return result;
};

export const deletePromotion = async (id: string): Promise<void> => {
  await assertAdminAal2();
  const client = getSupabaseOrThrow();

  const { error } = await client.from("promotions").delete().eq("id", id);
  if (error && !isLocalAdminActive()) {
    throw new Error(`Database error deleting promotion: ${error.message}`);
  }

  const current = readLocalPromotions().filter((c) => c.id !== id);
  writeLocalPromotions(current);
  notifyListeners();
};

export const archivePromotion = async (id: string): Promise<void> => {
  await assertAdminAal2();
  const current = readLocalPromotions();
  const target = current.find((c) => c.id === id);
  if (!target) return;

  const nextStatus: PromotionStatus = target.status === "archived" ? "draft" : "archived";
  await savePromotion({ ...target, status: nextStatus });
};

export const togglePromotionEnabled = async (id: string, enabled: boolean): Promise<void> => {
  await assertAdminAal2();
  const client = getSupabaseOrThrow();

  const { data: existing, error: readError } = await client.from("promotions").select("*").eq("id", id).single();
  if (readError && !isLocalAdminActive()) {
    throw new Error(`Could not fetch campaign: ${readError.message}`);
  }

  const campaign = existing ? mapRowToCampaign(existing) : readLocalPromotions().find((c) => c.id === id);
  if (!campaign) throw new Error("Campaign not found.");

  await savePromotion({ ...campaign, isEnabled: enabled });
};

export const duplicatePromotion = async (id: string): Promise<PromotionCampaign> => {
  await assertAdminAal2();
  const current = readLocalPromotions();
  const target = current.find((c) => c.id === id);
  if (!target) throw new Error("Campaign not found to duplicate.");

  const newId = `promo-${Date.now()}`;
  const newSlug = `${target.slug}-copy-${Date.now().toString().slice(-4)}`;
  const cloned: Partial<PromotionCampaign> = {
    ...target,
    id: newId,
    slug: newSlug,
    title: `${target.title} (Draft Copy)`,
    status: "draft",
    currentRedemptions: 0,
    viewCount: 0,
    clickCount: 0,
    ordersCount: 0,
    totalDiscountGiven: 0,
    totalGiftsAllocated: 0,
    totalAttributedSales: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return await savePromotion(cloned);
};

export const recordPromotionView = async (id: string): Promise<void> => {
  if (!supabase) return;
  try {
    await supabase.rpc("increment_promotion_view", { promo_id: id });
  } catch {
    // Non-blocking
  }
};

export const recordPromotionClick = async (id: string): Promise<void> => {
  if (!supabase) return;
  try {
    await supabase.rpc("increment_promotion_click", { promo_id: id });
  } catch {
    // Non-blocking
  }
};
