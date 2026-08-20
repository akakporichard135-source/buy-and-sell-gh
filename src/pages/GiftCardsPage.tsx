import { Gift } from "lucide-react";
import { FormField } from "../components/FormField";
import { SEO } from "../components/SEO";
import { SuccessForm } from "../components/SuccessForm";
import { WhatsAppButton } from "../components/WhatsAppButton";
import visaCardCampaign from "../assets/homepage/homepage-visa-card-trading.webp";

export function GiftCardsPage() {
  return (
    <>
      <SEO title="Visa Card Trading Enquiry" description="Contact Buy & Sell GH to check supported Visa card trading options. Values and accepted cards are confirmed directly." />
      <section className="service-hero service-hero-dark">
        <div>
          <p className="campaign-eyebrow">Visa Card Trading</p>
          <h1>Check a supported card.</h1>
          <p>Send details for review. Buy & Sell GH confirms accepted card types and value before any next step.</p>
        </div>
        <img src={visaCardCampaign} alt="Generic premium card trading visual with unbranded payment cards and a smartphone" loading="eager" decoding="async" />
      </section>
      <section className="section service-layout">
        <SuccessForm buttonLabel="Prepare Visa Card Enquiry" successIntent="general">
          <FormField label="Customer name" name="name" required maxLength={120} />
          <FormField label="Phone number" name="phone" required maxLength={32} />
          <FormField label="Card type" name="cardType" placeholder="Example: Visa card" required maxLength={120} />
          <FormField label="Card currency" name="currency" maxLength={40} />
          <FormField label="Card value" name="cardValue" required maxLength={80} />
          <FormField label="Country/region on card" name="region" maxLength={120} />
          <FormField label="Additional information" name="details" textarea maxLength={1600} />
        </SuccessForm>
        <aside className="service-side-card">
          <Gift size={24} />
          <h2>No rate promise online</h2>
          <p>Rates, acceptance and next steps are confirmed directly by Buy & Sell GH. This page does not guarantee a value.</p>
          <WhatsAppButton className="mt-6 w-full">Check on WhatsApp</WhatsAppButton>
        </aside>
      </section>
    </>
  );
}
