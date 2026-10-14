import { ExternalLink, MapPin, Phone } from "lucide-react";
import { useCms } from "../cms/CmsContext";
import { FormField } from "../components/FormField";
import { SEO } from "../components/SEO";
import { SuccessForm } from "../components/SuccessForm";
import { WhatsAppButton } from "../components/WhatsAppButton";
import { business } from "../config/business";
import "../styles/service-experience.css";

export function ContactPage() {
  const { settings } = useCms();

  const phonePrimary = settings?.phones?.[0] || business.phones[0];
  const phoneSecondary = settings?.phones?.[1] || business.phones[1];
  const waPrimary = settings?.whatsapp?.primary || business.whatsapp.primary;
  const waSecondary = settings?.whatsapp?.secondary || business.whatsapp.secondary;
  const storeLocation = settings?.location || business.location;
  const hours = settings?.hours && settings.hours.length > 0 ? settings.hours : business.hours;
  const username = settings?.username || business.username;

  return (
    <div className="service-experience-page contact-experience">
      <SEO title="Contact Buy & Sell GH" description="Contact Buy & Sell GH by phone or WhatsApp, visit Accra Dome Pillar 2 No Visa, or submit a contact form." />
      <section className="contact-experience-hero">
        <p className="eyebrow-dark">Contact</p>
        <h1>Talk to Buy & Sell GH</h1>
        <p>Call, WhatsApp, send a message, or confirm a visit to the shop in Accra.</p>
      </section>
      <section className="contact-experience-layout">
        <aside className="contact-experience-details">
          <a href={`tel:${waPrimary}`}><Phone /> <div><strong>{phonePrimary}</strong><span>Primary phone and WhatsApp</span></div></a>
          <a href={`tel:${waSecondary}`}><Phone /> <div><strong>{phoneSecondary}</strong><span>Secondary phone and WhatsApp</span></div></a>
          <div><MapPin /> <div><strong>{storeLocation}</strong><span>Confirm product availability and pickup timing before setting off.</span></div></div>
          <div className="contact-experience-hours">
            <h2 className="text-xl font-black">Opening hours</h2>
            {hours.map((hour) => <p className="mt-3 text-sm font-bold text-ink/70" key={hour.day}>{hour.day}: {hour.time}</p>)}
          </div>
          <WhatsAppButton className="w-full">Open WhatsApp</WhatsAppButton>
        </aside>
        <div>
          <SuccessForm buttonLabel="Prepare contact message" successIntent="general">
            <FormField label="Name" name="name" required maxLength={120} />
            <FormField label="Phone number" name="phone" required maxLength={32} />
            <FormField label="Subject" name="subject" maxLength={160} />
            <FormField label="Message" name="message" textarea required maxLength={2000} />
          </SuccessForm>
          <div className="contact-visit-details">
            <p className="eyebrow-dark">Visit the shop</p>
            <h2 className="mt-2 text-2xl font-black">{storeLocation}</h2>
            <p className="mt-3 text-sm font-bold leading-7 text-ink/65">Contact Buy & Sell GH before setting off so product availability and pickup timing can be confirmed.</p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <WhatsAppButton className="sm:w-auto">Confirm Visit</WhatsAppButton>
              <a className="btn-secondary" href={`tel:${waPrimary}`}><Phone size={17} /> Call Shop</a>
              <a className="btn-ghost" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(storeLocation)}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={17} /> Open Map
              </a>
            </div>
          </div>
          <p className="mt-4 text-sm font-black text-ink">Social media: {username}</p>
        </div>
      </section>
    </div>
  );
}

