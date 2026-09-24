import { FormField } from "../components/FormField";
import { SEO } from "../components/SEO";
import { SuccessForm } from "../components/SuccessForm";
import { WhatsAppButton } from "../components/WhatsAppButton";
import preOrderArtwork from "../assets/homepage/homepage-preorder-premium.jpg";
import { useSearchParams } from "react-router-dom";
import "../styles/service-experience.css";

export function DeviceRequestPage() {
  const [searchParams] = useSearchParams();
  const requestedModel = searchParams.get("model")?.trim() ?? "";
  const requestedStorage = searchParams.get("storage")?.trim() ?? "";
  const requestedColor = searchParams.get("color")?.trim() ?? "";

  return (
    <div className="service-experience-page preorder-experience">
      <SEO title="Pre-Order an Apple Device" description="Pre-order an Apple device that is not currently available on the Buy & Sell GH website." />
      <section className="preorder-hero">
        <div>
          <p className="eyebrow-dark">Pre-Order</p>
          <h1>Can't find the device you want?</h1>
          <p>This is a sourcing request, not a stock promise. Tell us exactly what you need and Buy & Sell GH will review availability before any payment step.</p>
        </div>
        <img src={preOrderArtwork} alt="Premium reserved device pre-order artwork" loading="eager" decoding="async" />
      </section>
      <section className="service-request-layout">
        <SuccessForm buttonLabel="Prepare Pre-Order" successIntent="request">
          <FormField label="Device model" name="model" required defaultValue={requestedModel} maxLength={160} />
          <FormField label="Storage" name="storage" defaultValue={requestedStorage} maxLength={80} />
          <FormField label="Colour" name="color" defaultValue={requestedColor} maxLength={80} />
          <FormField label="Preferred condition" name="condition" options={["Brand New", "UK Used", "Either"]} />
          <FormField label="Budget" name="budget" required maxLength={80} />
          <FormField label="Preferred payment method" name="payment" options={["Cash", "Mobile Money", "Bank transfer", "To confirm"]} />
          <FormField label="Delivery location" name="delivery" maxLength={500} />
          <FormField label="Customer name" name="name" required maxLength={120} />
          <FormField label="Phone number" name="phone" required maxLength={32} />
          <FormField label="Additional information" name="info" textarea maxLength={2000} />
        </SuccessForm>
        <aside className="service-guidance">
          <p>How it works</p>
          <h2>A request first. Confirmation second.</h2>
          <ol><li>Share the device and preferences.</li><li>The team reviews sourcing and current pricing.</li><li>You receive confirmed next steps before payment.</li></ol>
          <WhatsAppButton intent="request" className="mt-6 w-full">Pre-Order on WhatsApp</WhatsAppButton>
        </aside>
      </section>
    </div>
  );
}
