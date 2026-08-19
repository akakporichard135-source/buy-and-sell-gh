import { Wrench } from "lucide-react";
import { FormField } from "../components/FormField";
import { SEO } from "../components/SEO";
import { SuccessForm } from "../components/SuccessForm";
import { WhatsAppButton } from "../components/WhatsAppButton";
import repairsCampaign from "../assets/homepage/owner-repairs.jpg";

export function RepairsPage() {
  return (
    <>
      <SEO title="Device Repairs" description="Book a phone, laptop or game console repair enquiry with Buy & Sell GH in Accra." />
      <section className="service-hero service-hero-light">
        <div>
          <p className="campaign-eyebrow">Repairs</p>
          <h1>Let the experts fix it.</h1>
          <p>Prepare a phone, laptop or game console repair enquiry and continue on WhatsApp with photos and details.</p>
        </div>
        <img src={repairsCampaign} alt="Premium repair workspace with a technician fixing a smartphone" loading="eager" decoding="async" />
      </section>
      <section className="section service-layout">
        <SuccessForm buttonLabel="Prepare Repair Enquiry" successIntent="general">
          <FormField label="Customer name" name="name" required maxLength={120} />
          <FormField label="Phone number" name="phone" required maxLength={32} />
          <FormField label="Device type" name="deviceType" options={["Mobile phone", "Laptop", "Game console", "Tablet", "Other"]} required />
          <FormField label="Device model" name="model" required maxLength={160} />
          <FormField label="Problem summary" name="issue" required maxLength={500} />
          <FormField label="Repair history" name="repairHistory" maxLength={500} />
          <FormField label="Preferred visit time" name="visitTime" maxLength={120} />
          <FormField label="Additional information" name="details" textarea maxLength={1600} />
          <label className="service-upload block text-sm font-black text-ink">
            Upload device photos
            <input className="mt-2 w-full rounded-lg border border-black/10 bg-white px-4 py-3.5 text-base font-semibold text-ink outline-none transition focus:border-gold focus:ring-4 focus:ring-gold/15" name="images" type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple />
            <span>Optional. You can attach clear photos after opening WhatsApp.</span>
          </label>
        </SuccessForm>
        <aside className="service-side-card">
          <Wrench size={24} />
          <h2>Repair support</h2>
          <p>Final repair cost and timing are confirmed only after Buy & Sell GH inspects the device and issue.</p>
          <WhatsAppButton className="mt-6 w-full">Repair WhatsApp</WhatsAppButton>
        </aside>
      </section>
    </>
  );
}
