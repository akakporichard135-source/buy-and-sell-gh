import { Gift } from "lucide-react";
import { useCms } from "../cms/CmsContext";
import { defaultPageContent } from "../cms/defaultCmsData";
import { FormField } from "../components/FormField";
import { SEO } from "../components/SEO";
import { SuccessForm } from "../components/SuccessForm";
import { WhatsAppButton } from "../components/WhatsAppButton";
import defaultVisaCardCampaign from "../assets/homepage/homepage-visa-card-single.webp";

export function GiftCardsPage() {
  const { pages } = useCms();
  const visaCard = pages?.visaCard || defaultPageContent.visaCard;

  const title = visaCard?.title || "Visa Card Trading Enquiry";
  const eyebrow = visaCard?.eyebrow || "Visa Card Trading";
  const heading = visaCard?.heading || "Check a supported card.";
  const subtitle =
    visaCard?.subtitle ||
    "Send details for review. Buy & Sell GH confirms accepted card types and value before any next step.";
  const image = visaCard?.image || defaultVisaCardCampaign;
  const sideCardHeading = visaCard?.sideCardHeading || "No rate promise online";
  const sideCardText =
    visaCard?.sideCardText ||
    "Rates, acceptance and next steps are confirmed directly by Buy & Sell GH. This page does not guarantee a value.";
  const whatsappLabel = visaCard?.whatsappLabel || "Check on WhatsApp";

  return (
    <>
      <SEO
        title={title}
        description="Contact Buy & Sell GH to check supported Visa card trading options. Values and accepted cards are confirmed directly."
      />
      <section className="service-hero service-hero-dark">
        <div>
          <p className="campaign-eyebrow">{eyebrow}</p>
          <h1>{heading}</h1>
          <p>{subtitle}</p>
        </div>
        <img
          src={image}
          alt={heading}
          loading="eager"
          decoding="async"
        />
      </section>
      <section className="section service-layout">
        <SuccessForm serviceType="visa-card" buttonLabel="Submit Visa Card Enquiry">
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
          <h2>{sideCardHeading}</h2>
          <p>{sideCardText}</p>
          <WhatsAppButton className="mt-6 w-full">{whatsappLabel}</WhatsAppButton>
        </aside>
      </section>
    </>
  );
}
