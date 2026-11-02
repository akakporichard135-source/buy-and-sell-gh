import { WhatsAppButton } from "./WhatsAppButton";
import type { WhatsAppIntent } from "../utils/whatsapp";
import "../styles/service-booking.css";

type ServiceBookingPageProps = {
  category: string;
  title: string;
  description: string;
  guidance: string;
  assistance: string;
  intent?: WhatsAppIntent;
  children: React.ReactNode;
};

export function ServiceBookingPage({ category, title, description, guidance, assistance, intent = "general", children }: ServiceBookingPageProps) {
  return (
    <main className="service-booking-page">
      <div className="service-booking-container">
        <header className="service-booking-intro">
          <p className="service-booking-category">Our services / {category}</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </header>
        <div className="service-booking-layout">
          <div className="service-booking-primary">
            {children}
            <p className="service-booking-form-note">Submitting saves your request for our team. WhatsApp is optional after confirmation.</p>
          </div>
          <aside className="service-booking-aside" aria-label={`${category} information and assistance`}>
            <section>
              <h2>What to expect</h2>
              <p>{guidance}</p>
            </section>
            <section>
              <h2>Need assistance?</h2>
              <p>{assistance}</p>
              <WhatsAppButton intent={intent}>Ask on WhatsApp</WhatsAppButton>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

export function ServicePhotoField() {
  return (
    <label className="service-booking-photo-field">
      Device photos <span>(optional)</span>
      <input name="images" type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple />
      <small>Photos are not uploaded with this form. Attach up to six in WhatsApp separately if you choose to continue there.</small>
    </label>
  );
}
