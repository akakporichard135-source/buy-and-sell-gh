import { CreditCard, ShieldCheck } from "lucide-react";
import { FormField } from "../components/FormField";
import { SEO } from "../components/SEO";
import { SuccessForm } from "../components/SuccessForm";
import { WhatsAppButton } from "../components/WhatsAppButton";
import installmentCampaign from "../assets/homepage/homepage-installment-campaign.jpg";

export function InstallmentPage() {
  return (
    <>
      <SEO title="iPhone Installment Payment" description="Enquire about Buy & Sell GH iPhone installment payment with 40% upfront and Ghana Card requirements." />
      <section className="service-hero service-hero-dark">
        <div>
          <p className="campaign-eyebrow">iPhone Installment</p>
          <h1>Own an iPhone today.</h1>
          <p>Pay just 40% upfront. Ghana Card and 40% initial payment are required before Buy & Sell GH confirms next steps.</p>
          <div className="campaign-note-row">
            <span>40% upfront</span>
            <span>Ghana Card required</span>
          </div>
        </div>
        <img src={installmentCampaign} alt="Premium iPhones and payment tokens for installment enquiry" loading="eager" decoding="async" />
      </section>
      <section className="section service-layout">
        <div>
          <div className="service-intro-card">
            <CreditCard size={24} />
            <h2>Installment enquiry</h2>
            <p>This form prepares your request for WhatsApp. Final approval, product availability and payment details are confirmed directly by Buy & Sell GH.</p>
          </div>
          <SuccessForm buttonLabel="Prepare Installment Enquiry" successIntent="general">
            <FormField label="Customer name" name="name" required maxLength={120} />
            <FormField label="Phone number" name="phone" required maxLength={32} />
            <FormField label="Preferred iPhone model" name="model" required maxLength={160} />
            <FormField label="Preferred storage" name="storage" options={["64GB", "128GB", "256GB", "512GB", "1TB", "Not sure"]} />
            <FormField label="Preferred colour" name="colour" maxLength={80} />
            <FormField label="Budget range" name="budget" required maxLength={80} />
            <FormField label="Ghana Card available?" name="ghanaCard" options={["Yes", "No", "Need guidance"]} required />
            <FormField label="Additional information" name="details" textarea maxLength={1600} />
          </SuccessForm>
        </div>
        <aside className="service-side-card">
          <ShieldCheck size={24} />
          <h2>Important note</h2>
          <p>Buy & Sell GH confirms product availability, eligibility, payment details and delivery or pickup directly. Do not send passwords, PINs or private account credentials.</p>
          <WhatsAppButton className="mt-6 w-full">Ask on WhatsApp</WhatsAppButton>
        </aside>
      </section>
    </>
  );
}
