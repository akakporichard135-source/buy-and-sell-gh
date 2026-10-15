import { Navigate } from "react-router-dom";
import { AdminAccountPage } from "./AdminAccountPage";
import { AdminHomepageManager } from "./AdminHomepageManager";
import { AdminLearnMorePages } from "./AdminLearnMorePages";
import { AdminInquiriesPage } from "./AdminInquiriesPage";
import { AdminMediaLibrary } from "./AdminMediaLibrary";
import { AdminOrdersPage } from "./AdminOrdersPage";
import { AdminPagesManager } from "./AdminPagesManager";
import { AdminPricingManager } from "./AdminPricingManager";
import { AdminProductManager } from "./AdminProductManager";
import { AdminPromotionsPage } from "./AdminPromotionsPage";
import { AdminReviewsPage } from "./AdminReviewsPage";
import { AdminServicesManager } from "./AdminServicesManager";
import { AdminSettingsPage } from "./AdminSettingsPage";
import { AdminStorefrontManager } from "./AdminStorefrontManager";

export type AdminSection =
  | "products"
  | "pricing"
  | "orders"
  | "media"
  | "homepage"
  | "learn-more"
  | "storefront"
  | "services"
  | "pages"
  | "trade-ins"
  | "device-requests"
  | "contact-messages"
  | "reviews"
  | "promotions"
  | "settings"
  | "account";

export function AdminSectionPage({ section }: { section: AdminSection }) {
  switch (section) {
    case "products":
      return <AdminProductManager />;
    case "pricing":
      return <Navigate to="/admin/products" replace />;
    case "orders":
      return <AdminOrdersPage />;
    case "media":
      return <AdminMediaLibrary />;
    case "homepage":
      return <AdminHomepageManager />;
    case "learn-more":
      return <AdminLearnMorePages />;
    case "storefront":
      return <AdminStorefrontManager />;
    case "services":
      return <AdminServicesManager />;
    case "pages":
      return <AdminPagesManager />;
    case "trade-ins":
      return <AdminInquiriesPage mode="trade-ins" />;
    case "device-requests":
      return <AdminInquiriesPage mode="device-requests" />;
    case "contact-messages":
      return <AdminInquiriesPage mode="contact-messages" />;
    case "reviews":
      return <AdminReviewsPage />;
    case "promotions":
      return <AdminPromotionsPage />;
    case "settings":
      return <AdminSettingsPage />;
    case "account":
      return <AdminAccountPage />;
    default:
      return <AdminProductManager />;
  }
}

