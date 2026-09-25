import { Instagram, MapPin, MessageCircle, Phone, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";
import { business } from "../config/business";

const footerColumns = [
  {
    title: "Shop and Learn",
    links: [["Store", "/store"], ["iPhone", "/iphone"], ["Mac", "/mac"], ["iPad", "/ipad"], ["Watch", "/watch"], ["AirPods", "/airpods"], ["Accessories", "/accessories"]],
  },
  {
    title: "Services",
    links: [["Trade In", "/sell-or-trade"], ["Repairs", "/repairs"], ["Installment", "/installment"], ["Visa Card Trading", "/gift-cards"], ["Pre-Order", "/pre-order"], ["Refer a Friend", "/refer-a-friend"]],
  },
  {
    title: "Account",
    links: [["Account Support", "/account"], ["Cart", "/cart"], ["Order Requests", "/cart"], ["Shopping Information", "/shopping-information"]],
  },
  {
    title: "About",
    links: [["About Buy & Sell GH", "/about"], ["Others", "/others"], ["Contact", "/contact"], ["FAQ", "/faq"]],
  },
  {
    title: "Support",
    links: [["Contact Support", "/contact"], ["Device Request", "/pre-order"], ["Sell or Trade", "/sell-or-trade"]],
  },
];

export function Footer() {
  return (
    <footer className="store-footer">
      <div className="store-footer-brand">
        <div className="store-footer-logo"><Smartphone size={21} /><strong>Buy & Sell GH</strong></div>
        <p>Original devices, trusted service and clear support from Dome Pillar 2 in Accra.</p>
      </div>
      <div className="store-footer-columns">
        {footerColumns.map((column) => (
          <section key={column.title}>
            <h2>{column.title}</h2>
            {column.links.map(([label, to]) => <Link to={to} key={label}>{label}</Link>)}
          </section>
        ))}
      </div>
      <div className="store-footer-accordions">
        {footerColumns.map((column) => (
          <details key={column.title}>
            <summary>{column.title}<span aria-hidden="true">+</span></summary>
            <div>{column.links.map(([label, to]) => <Link to={to} key={label}>{label}</Link>)}</div>
          </details>
        ))}
      </div>
      <div className="store-footer-contact">
        <a href={`tel:${business.whatsapp.primary}`}><Phone size={15} /> {business.phones[0]}</a>
        <a href={`https://wa.me/${business.whatsapp.primary}`} target="_blank" rel="noopener noreferrer"><MessageCircle size={15} /> WhatsApp</a>
        <span><MapPin size={15} /> {business.location}</span>
        <a href={business.social.instagram} target="_blank" rel="noopener noreferrer"><Instagram size={15} /> {business.username}</a>
      </div>
      <div className="store-footer-legal">
        <p>Copyright 2026 Buy & Sell GH. All rights reserved.</p>
        <p>Independent gadget retailer. Product names and trademarks belong to their respective owners.</p>
      </div>
    </footer>
  );
}
