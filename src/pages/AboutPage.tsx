import { CheckCircle2 } from "lucide-react";
import { useCms } from "../cms/CmsContext";
import { SEO } from "../components/SEO";
import { business } from "../config/business";

export function AboutPage() {
  const { pages, settings } = useCms();
  const about = pages?.about;

  const eyebrow = about?.eyebrow || settings?.username || business.username;
  const title = about?.title || "A premium gadget shop built around trust";
  const subtitle =
    about?.subtitle ||
    `${settings?.name || business.name} helps customers buy, sell, swap and request original Apple devices in Accra.`;

  const pillars =
    about?.pillars && about.pillars.length > 0
      ? about.pillars.map((p) => p.title)
      : [
          "Original and inspected devices",
          "Clear product information",
          "WhatsApp-first service",
          "Trade-in support",
          "Pickup in Dome",
          "Delivery guidance",
        ];

  return (
    <>
      <SEO
        title="About Buy & Sell GH"
        description="Learn about Buy & Sell GH, a trusted Accra shop for original iPhones, iPads and Apple gadgets."
      />
      <section className="page-hero">
        <p className="eyebrow-dark">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </section>
      <section className="section grid gap-6 lg:grid-cols-3">
        {pillars.map((item) => (
          <div className="rounded-lg border border-black/7 bg-white p-6 shadow-card" key={item}>
            <CheckCircle2 className="text-gold-dark" />
            <h2 className="mt-4 text-xl font-black">{item}</h2>
          </div>
        ))}
      </section>
    </>
  );
}
