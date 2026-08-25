import { FormField } from "../components/FormField";
import { SEO } from "../components/SEO";
import { SuccessForm } from "../components/SuccessForm";
import { WhatsAppButton } from "../components/WhatsAppButton";
import preOrderArtwork from "../assets/homepage/homepage-preorder-premium.jpg";

export function DeviceRequestPage() {
  return (
    <>
      <SEO title="Pre-Order an Apple Device" description="Pre-order an Apple device that is not currently available on the Buy & Sell GH website." />
      <section className="page-hero device-request-hero">
        <div>
          <p className="eyebrow-dark">Pre-Order</p>
          <h1>Can't find the device you want?</h1>
          <p>Use this form when the device you want is not currently available on the website. Tell us the exact device you're looking for and Buy & Sell GH will help you source it.</p>
        </div>
        <img src={preOrderArtwork} alt="Premium reserved device pre-order artwork" loading="eager" decoding="async" />
      </section>
      <section className="section device-request-layout grid gap-8">
        <SuccessForm buttonLabel="Prepare Pre-Order" successIntent="request">
          <FormField label="Device model" name="model" required maxLength={160} />
          <FormField label="Storage" name="storage" options={["64GB", "128GB", "256GB", "512GB", "1TB"]} />
          <FormField label="Colour" name="color" maxLength={80} />
          <FormField label="Preferred condition" name="condition" options={["Brand New", "UK Used", "Either"]} />
          <FormField label="Budget" name="budget" required maxLength={80} />
          <FormField label="Preferred payment method" name="payment" options={["Cash", "Mobile Money", "Bank transfer", "To confirm"]} />
          <FormField label="Delivery location" name="delivery" maxLength={500} />
          <FormField label="Customer name" name="name" required maxLength={120} />
          <FormField label="Phone number" name="phone" required maxLength={32} />
          <FormField label="Additional information" name="info" textarea maxLength={2000} />
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
