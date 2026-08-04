import { Route, Routes } from "react-router-dom";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { WhatsAppButton } from "./components/WhatsAppButton";
import { AboutPage } from "./pages/AboutPage";
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
