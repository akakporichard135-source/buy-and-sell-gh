import { Instagram, MapPin, MessageCircle, Phone, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";
import { business } from "../config/business";
import { WhatsAppButton } from "./WhatsAppButton";

export function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_0.7fr_0.7fr_0.7fr] lg:px-8">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full border border-gold/50 bg-black text-gold">
              <Smartphone size={22} />
            </span>
            <div className="text-lg font-black uppercase">Buy & Sell GH</div>
          </div>
          <p className="max-w-md text-sm leading-7 text-white/70">
            Independent Accra electronics retailer for phones, tablets, laptops, game consoles, audio and accessories, plus trade-ins and pre-orders.
          </p>
          <WhatsAppButton className="mt-5">Chat on WhatsApp</WhatsAppButton>
        </div>
        <div>
          <h2 className="footer-heading">Contact</h2>
          <a className="footer-line" href={`tel:${business.whatsapp.primary}`}><Phone size={16} /> {business.phones[0]}</a>
          <a className="footer-line" href={`tel:${business.whatsapp.secondary}`}><Phone size={16} /> {business.phones[1]}</a>
          <p className="footer-line"><MessageCircle size={16} /> WhatsApp available</p>
          <p className="footer-line"><MapPin size={16} /> {business.location}</p>
        </div>
        <div>
          <h2 className="footer-heading">Quick Links</h2>
          <div className="grid gap-2 text-sm text-white/70">
            <Link to="/">Home</Link>
            <Link to="/shop">Shop devices</Link>
            <Link to="/sell-or-trade">Sell or trade</Link>
            <Link to="/pre-order">Pre-Order</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/about">About</Link>
            <Link to="/faq">FAQ</Link>
            <Link to="/shopping-information">Shopping information</Link>
          </div>
        </div>
        <div>
          <h2 className="footer-heading">Categories</h2>
          <div className="grid gap-2 text-sm text-white/70">
            <Link to="/shop?category=Phones">Phones</Link>
            <Link to="/shop?category=Tablets">Tablets</Link>
            <Link to="/shop?category=Laptops">Laptops</Link>
            <Link to="/shop?category=Watches">Watches</Link>
            <Link to="/shop?category=Game%20Consoles">Game Consoles</Link>
            <Link to="/shop?category=Accessories">Accessories</Link>
            <Link to="/shop?category=Audio">Audio</Link>
          </div>
          <h2 className="footer-heading mt-7">Social</h2>
          <a className="footer-line" href={business.social.instagram} target="_blank" rel="noopener noreferrer"><Instagram size={16} /> {business.username}</a>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs leading-6 text-white/55">
        <p>Copyright 2026 Buy & Sell GH. All rights reserved.</p>
        <p>Buy & Sell GH is an independent gadget retailer. Product names and trademarks belong to their respective owners.</p>
      </div>
    </footer>
  );
}
