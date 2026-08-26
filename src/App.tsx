import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AdminAuthProvider } from "./admin/AdminAuth";
import { ProtectedAdminRoute } from "./admin/ProtectedAdminRoute";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { WhatsAppButton } from "./components/WhatsAppButton";
import { AdminLayout } from "./layouts/AdminLayout";

const AboutPage = lazy(() => import("./pages/AboutPage").then((module) => ({ default: module.AboutPage })));
const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboardPage").then((module) => ({ default: module.AdminDashboardPage })));
const AdminLoginPage = lazy(() => import("./pages/admin/AdminLoginPage").then((module) => ({ default: module.AdminLoginPage })));
const AdminMfaPage = lazy(() => import("./pages/admin/AdminMfaPage").then((module) => ({ default: module.AdminMfaPage })));
const AdminResetPasswordPage = lazy(() => import("./pages/admin/AdminResetPasswordPage").then((module) => ({ default: module.AdminResetPasswordPage })));
const AdminSectionPage = lazy(() => import("./pages/admin/AdminSectionPage").then((module) => ({ default: module.AdminSectionPage })));
const AdminOrderDetailPage = lazy(() => import("./pages/admin/AdminOrderDetailPage").then((module) => ({ default: module.AdminOrderDetailPage })));
const CartPage = lazy(() => import("./pages/CartPage").then((module) => ({ default: module.CartPage })));
const CategoryPage = lazy(() => import("./pages/CategoryPage").then((module) => ({ default: module.CategoryPage })));
const ContactPage = lazy(() => import("./pages/ContactPage").then((module) => ({ default: module.ContactPage })));
const DeviceRequestPage = lazy(() => import("./pages/DeviceRequestPage").then((module) => ({ default: module.DeviceRequestPage })));
const FAQPage = lazy(() => import("./pages/FAQPage").then((module) => ({ default: module.FAQPage })));
const HomePage = lazy(() => import("./pages/HomePage").then((module) => ({ default: module.HomePage })));
const InstallmentPage = lazy(() => import("./pages/InstallmentPage").then((module) => ({ default: module.InstallmentPage })));
const MobilePhonesPage = lazy(() => import("./pages/MobilePhonesPage").then((module) => ({ default: module.MobilePhonesPage })));
const ElectronicsPage = lazy(() => import("./pages/ElectronicsPage").then((module) => ({ default: module.ElectronicsPage })));
const RepairsPage = lazy(() => import("./pages/RepairsPage").then((module) => ({ default: module.RepairsPage })));
const GiftCardsPage = lazy(() => import("./pages/GiftCardsPage").then((module) => ({ default: module.GiftCardsPage })));
const ReferFriendPage = lazy(() => import("./pages/ReferFriendPage").then((module) => ({ default: module.ReferFriendPage })));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage").then((module) => ({ default: module.NotFoundPage })));
const OrderSuccessPage = lazy(() => import("./pages/OrderSuccessPage").then((module) => ({ default: module.OrderSuccessPage })));
const ProductDetailsPage = lazy(() => import("./pages/ProductDetailsPage").then((module) => ({ default: module.ProductDetailsPage })));
const SellTradePage = lazy(() => import("./pages/SellTradePage").then((module) => ({ default: module.SellTradePage })));
const ShopPage = lazy(() => import("./pages/ShopPage").then((module) => ({ default: module.ShopPage })));
const ShoppingInformationPage = lazy(() => import("./pages/ShoppingInformationPage").then((module) => ({ default: module.ShoppingInformationPage })));

export default function App() {
  return (
    <AdminAuthProvider>
      <Suspense fallback={<RouteLoading />}>
        <Routes>
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/mfa" element={<AdminMfaPage />} />
          <Route path="/admin/reset-password" element={<AdminResetPasswordPage />} />
          <Route element={<ProtectedAdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="products" element={<AdminSectionPage section="products" />} />
              <Route path="orders" element={<AdminSectionPage section="orders" />} />
              <Route path="orders/:orderId" element={<AdminOrderDetailPage />} />
              <Route path="trade-ins" element={<AdminSectionPage section="trade-ins" />} />
              <Route path="device-requests" element={<AdminSectionPage section="device-requests" />} />
              <Route path="contact-messages" element={<AdminSectionPage section="contact-messages" />} />
              <Route path="reviews" element={<AdminSectionPage section="reviews" />} />
              <Route path="promotions" element={<AdminSectionPage section="promotions" />} />
              <Route path="settings" element={<AdminSectionPage section="settings" />} />
              <Route path="account" element={<AdminSectionPage section="account" />} />
            </Route>
          </Route>
          <Route path="*" element={<PublicShell />} />
        </Routes>
      </Suspense>
    </AdminAuthProvider>
  );
}

function PublicShell() {
  return (
    <div className="public-shell min-h-screen bg-page text-ink">
      <Header />
      <main className="public-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/mobile-phones" element={<MobilePhonesPage />} />
          <Route path="/electronics" element={<ElectronicsPage />} />
          <Route path="/installment" element={<InstallmentPage />} />
          <Route path="/repairs" element={<RepairsPage />} />
          <Route path="/gift-cards" element={<GiftCardsPage />} />
          <Route path="/refer-a-friend" element={<ReferFriendPage />} />
          <Route path="/:categorySlug" element={<CategoryPage />} />
          <Route path="/product/:slug" element={<ProductDetailsPage />} />
          <Route path="/sell-or-trade" element={<SellTradePage />} />
          <Route path="/pre-order" element={<DeviceRequestPage />} />
          <Route path="/device-request" element={<Navigate to="/pre-order" replace />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/shopping-information" element={<ShoppingInformationPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/order-success/:reference" element={<OrderSuccessPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      <WhatsAppButton className="floating-whatsapp fixed z-40 px-4 py-3 shadow-2xl">Chat</WhatsAppButton>
    </div>
  );
}

function RouteLoading() {
  return (
    <div className="route-loading" role="status" aria-live="polite">
      Loading Buy & Sell GH...
    </div>
  );
}
