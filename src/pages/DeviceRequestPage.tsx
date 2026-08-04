import { FormField } from "../components/FormField";
import { SEO } from "../components/SEO";
import { SuccessForm } from "../components/SuccessForm";
import { WhatsAppButton } from "../components/WhatsAppButton";

export function DeviceRequestPage() {
  return (
    <>
      <SEO title="Request an iPhone or Gadget" description="Request unavailable iPhones, iPads and Apple gadgets from Buy & Sell GH in Accra." />
      <section className="page-hero">
        <p className="eyebrow-dark">Device Request</p>
        <h1>Request the exact Apple device you want</h1>
        <p>Share the model, storage, colour, budget and delivery location so the shop can follow up.</p>
      </section>
      <section className="section grid gap-8 lg:grid-cols-[1fr_340px]">
        <SuccessForm buttonLabel="Submit device request">
          <FormField label="Device model" name="model" required />
          <FormField label="Storage" name="storage" options={["64GB", "128GB", "256GB", "512GB", "1TB"]} />
          <FormField label="Colour" name="color" />
          <FormField label="Condition" name="condition" options={["Brand New", "UK Used", "Either"]} />
          <FormField label="Budget" name="budget" required />
          <FormField label="Preferred payment method" name="payment" options={["Cash", "Mobile Money", "Bank transfer", "To confirm"]} />
          <FormField label="Delivery location" name="delivery" />
          <FormField label="Customer name" name="name" required />
          <FormField label="Phone number" name="phone" required />
          <FormField label="Additional information" name="info" textarea />
        </SuccessForm>
        <div className="panel-gold">
          <h2>Need a fast reply?</h2>
          <p>Open WhatsApp with a device request message and share any screenshots or preferences.</p>
          <WhatsAppButton intent="request" className="mt-6 w-full">Request on WhatsApp</WhatsAppButton>
        </div>
      </section>
    </>
  );
}
