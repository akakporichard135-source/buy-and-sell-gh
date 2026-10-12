import { AdminAccountPage } from "./AdminAccountPage";
import { AdminInquiriesPage } from "./AdminInquiriesPage";
import { AdminOrdersPage } from "./AdminOrdersPage";
import { AdminPricingManager } from "./AdminPricingManager";
import { AdminProductManager } from "./AdminProductManager";
import { AdminPromotionsPage } from "./AdminPromotionsPage";
import { AdminReviewsPage } from "./AdminReviewsPage";
import { AdminSettingsPage } from "./AdminSettingsPage";

export type AdminSection =
  | "products"
  | "pricing"
  | "orders"
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
      return <AdminPricingManager />;
    case "orders":
      return <AdminOrdersPage />;
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
