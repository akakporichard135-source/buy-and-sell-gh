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
            Independent Accra gadget retailer for original iPhones, iPads, Apple accessories, trade-ins and device requests.
          </p>
          <WhatsAppButton className="mt-5">Chat on WhatsApp</WhatsAppButton>
        </div>
        <div>
          <h2 className="footer-heading">Contact</h2>
          <p className="footer-line"><Phone size={16} /> {business.phones[0]}</p>
          <p className="footer-line"><Phone size={16} /> {business.phones[1]}</p>
          <p className="footer-line"><MessageCircle size={16} /> WhatsApp available</p>
          <p className="footer-line"><MapPin size={16} /> {business.location}</p>
        </div>
        <div>
          <h2 className="footer-heading">Quick Links</h2>
          <div className="grid gap-2 text-sm text-white/70">
            <Link to="/">Home</Link>
            <Link to="/shop">Shop devices</Link>
            <Link to="/sell-or-trade">Sell or trade</Link>
            <Link to="/device-request">Device request</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/faq">FAQ</Link>
          </div>
        </div>
        <div>
          <h2 className="footer-heading">Categories</h2>
          <div className="grid gap-2 text-sm text-white/70">
            <Link to="/shop?category=iPhones">iPhones</Link>
            <Link to="/shop?category=iPads">iPads</Link>
            <Link to="/shop?category=AirPods">AirPods</Link>
            <Link to="/shop?category=Apple%20Watches">Apple Watches</Link>
          </div>
          <h2 className="footer-heading mt-7">Social</h2>
          <a className="footer-line" href={business.social.instagram} target="_blank" rel="noreferrer"><Instagram size={16} /> {business.username}</a>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs leading-6 text-white/55">
        <p>© 2026 Buy & Sell GH. All rights reserved.</p>
        <p>Buy & Sell GH is an independent gadget retailer and is not affiliated with Apple Inc.</p>
      </div>
    </footer>
  );
}
