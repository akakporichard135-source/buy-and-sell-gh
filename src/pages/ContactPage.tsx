import { MapPin, Phone } from "lucide-react";
import { FormField } from "../components/FormField";
import { SEO } from "../components/SEO";
import { SuccessForm } from "../components/SuccessForm";
import { WhatsAppButton } from "../components/WhatsAppButton";
import { business } from "../config/business";

export function ContactPage() {
  return (
    <>
      <SEO title="Contact Buy & Sell GH" description="Contact Buy & Sell GH by phone or WhatsApp, visit Accra Dome Pillar 2 No Visa, or submit a contact form." />
      <section className="page-hero">
        <p className="eyebrow-dark">Contact</p>
        <h1>Talk to Buy & Sell GH</h1>
        <p>Call, WhatsApp, or visit the shop location listed by the business profile.</p>
      </section>
      <section className="section grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="grid gap-4">
          <a className="contact-card" href={`tel:${business.whatsapp.primary}`}><Phone /> <div><strong>{business.phones[0]}</strong><span>Primary phone and WhatsApp</span></div></a>
          <a className="contact-card" href={`tel:${business.whatsapp.secondary}`}><Phone /> <div><strong>{business.phones[1]}</strong><span>Secondary phone and WhatsApp</span></div></a>
          <div className="contact-card"><MapPin /> <div><strong>{business.location}</strong><span>Visit or contact the shop before setting off.</span></div></div>
          <div className="rounded-lg border border-black/7 bg-white p-5 shadow-card">
            <h2 className="text-xl font-black">Opening hours</h2>
            {business.hours.map((hour) => <p className="mt-3 text-sm font-bold text-ink/70" key={hour.day}>{hour.day}: {hour.time}</p>)}
          </div>
          <WhatsAppButton className="w-full">Open WhatsApp</WhatsAppButton>
        </div>
        <div>
          <SuccessForm buttonLabel="Send contact message">
            <FormField label="Name" name="name" required />
            <FormField label="Phone number" name="phone" required />
            <FormField label="Subject" name="subject" />
            <FormField label="Message" name="message" textarea required />
          </SuccessForm>
          <div className="mt-5 grid min-h-64 place-items-center rounded-lg border border-dashed border-black/20 bg-white p-6 text-center text-sm font-bold text-ink/60">
            Location card for Accra, Dome Pillar 2, No Visa. A Google Maps link can be added after the owner confirms it.
          </div>
          <p className="mt-4 text-sm font-black text-ink">Social media: {business.username}</p>
        </div>
      </section>
    </>
  );
}
