import { CheckCircle2 } from "lucide-react";
import { SEO } from "../components/SEO";
import { business } from "../config/business";

export function AboutPage() {
  return (
    <>
      <SEO title="About Buy & Sell GH" description="Learn about Buy & Sell GH, a trusted Accra shop for original iPhones, iPads and Apple gadgets." />
      <section className="page-hero">
        <p className="eyebrow-dark">{business.username}</p>
        <h1>A premium gadget shop built around trust</h1>
        <p>{business.name} helps customers buy, sell, swap and request original Apple devices in Accra.</p>
      </section>
      <section className="section grid gap-6 lg:grid-cols-3">
        {["Original and inspected devices", "Clear product information", "WhatsApp-first service", "Trade-in support", "Pickup in Dome", "Delivery guidance"].map((item) => (
          <div className="rounded-lg border border-black/7 bg-white p-6 shadow-card" key={item}>
            <CheckCircle2 className="text-gold-dark" />
            <h2 className="mt-4 text-xl font-black">{item}</h2>
          </div>
        ))}
      </section>
    </>
  );
}
