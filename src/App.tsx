import { Route, Routes } from "react-router-dom";
import { AdminAuthProvider } from "./admin/AdminAuth";
import { ProtectedAdminRoute } from "./admin/ProtectedAdminRoute";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { WhatsAppButton } from "./components/WhatsAppButton";
import { AdminLayout } from "./layouts/AdminLayout";
import { AboutPage } from "./pages/AboutPage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminLoginPage } from "./pages/admin/AdminLoginPage";
import { AdminSectionPage } from "./pages/admin/AdminSectionPage";
import { CartPage } from "./pages/CartPage";
import { ContactPage } from "./pages/ContactPage";
import { DeviceRequestPage } from "./pages/DeviceRequestPage";
import { FAQPage } from "./pages/FAQPage";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ProductDetailsPage } from "./pages/ProductDetailsPage";
import { SellTradePage } from "./pages/SellTradePage";
import { ShopPage } from "./pages/ShopPage";

export default function App() {
  return (
    <AdminAuthProvider>
      <Routes>
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route element={<ProtectedAdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="products" element={<AdminSectionPage section="products" />} />
            <Route path="orders" element={<AdminSectionPage section="orders" />} />
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
    </AdminAuthProvider>
  );
}

function PublicShell() {
  return (
    <div className="min-h-screen bg-page text-ink">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:slug" element={<ProductDetailsPage />} />
          <Route path="/sell-or-trade" element={<SellTradePage />} />
          <Route path="/device-request" element={<DeviceRequestPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      <WhatsAppButton className="floating-whatsapp fixed z-40 px-4 py-3 shadow-2xl">Chat</WhatsAppButton>
    </div>
  );
}
