import { FormField } from "../components/FormField";
import { SEO } from "../components/SEO";
import { SuccessForm } from "../components/SuccessForm";
import { WhatsAppButton } from "../components/WhatsAppButton";

export function DeviceRequestPage() {
  return (
    <>
      <SEO title="Pre-Order an Apple Device" description="Pre-order an Apple device that is not currently available on the Buy & Sell GH website." />
      <section className="page-hero device-request-hero">
        <p className="eyebrow-dark">Pre-Order</p>
        <h1>Can't find the device you want?</h1>
        <p>Use this form when the device you want is not currently available on the website. Tell us the exact Apple device you're looking for and Buy & Sell GH will help you source it.</p>
      </section>
      <section className="section device-request-layout grid gap-8">
        <SuccessForm buttonLabel="Prepare Pre-Order" successIntent="request">
          <FormField label="Device model" name="model" required />
          <FormField label="Storage" name="storage" options={["64GB", "128GB", "256GB", "512GB", "1TB"]} />
          <FormField label="Colour" name="color" />
          <FormField label="Preferred condition" name="condition" options={["Brand New", "UK Used", "Either"]} />
          <FormField label="Budget" name="budget" required />
          <FormField label="Preferred payment method" name="payment" options={["Cash", "Mobile Money", "Bank transfer", "To confirm"]} />
          <FormField label="Delivery location" name="delivery" />
          <FormField label="Customer name" name="name" required />
          <FormField label="Phone number" name="phone" required />
          <FormField label="Additional information" name="info" textarea />
        </SuccessForm>
        <aside className="panel-gold device-request-assist">
          <h2>Need a fast reply?</h2>
          <p>Open WhatsApp with your pre-order details and share any screenshots or preferences.</p>
          <WhatsAppButton intent="request" className="mt-6 w-full">Pre-Order on WhatsApp</WhatsAppButton>
        </aside>
      </section>
    </>
  );
}
