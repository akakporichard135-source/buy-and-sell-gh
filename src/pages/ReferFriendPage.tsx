import { Share2 } from "lucide-react";
import { FormField } from "../components/FormField";
import { SEO } from "../components/SEO";
import { SuccessForm } from "../components/SuccessForm";
import { WhatsAppButton } from "../components/WhatsAppButton";
import referralCampaign from "../assets/homepage/homepage-referral-campaign.jpg";

export function ReferFriendPage() {
  return (
    <>
      <SEO title="Refer a Friend" description="Refer someone to Buy & Sell GH for phones, repairs, trade-ins, pre-orders and tech support." />
      <section className="service-hero service-hero-light">
        <div>
          <p className="campaign-eyebrow">Refer a Friend</p>
          <h1>Good tech is better when shared.</h1>
          <p>Send a simple referral enquiry for someone looking for a device, repair, trade-in or pre-order.</p>
        </div>
        <img src={referralCampaign} alt="Premium smartphones with a clean sharing symbol" loading="eager" decoding="async" />
      </section>
      <section className="section service-layout">
        <SuccessForm buttonLabel="Prepare Referral" successIntent="general">
          <FormField label="Your name" name="yourName" required maxLength={120} />
          <FormField label="Your phone number" name="yourPhone" required maxLength={32} />
          <FormField label="Friend's name" name="friendName" required maxLength={120} />
          <FormField label="Friend's phone number" name="friendPhone" required maxLength={32} />
          <FormField label="What do they need?" name="interest" options={["Buy a device", "Sell or trade", "Repair", "Pre-order", "Gift card enquiry", "Not sure"]} required />
          <FormField label="Additional note" name="details" textarea maxLength={1200} />
        </SuccessForm>
        <aside className="service-side-card">
          <Share2 size={24} />
          <h2>Referral note</h2>
          <p>No reward or discount is promised here unless Buy & Sell GH confirms a current offer directly.</p>
          <WhatsAppButton className="mt-6 w-full">Referral WhatsApp</WhatsAppButton>
        </aside>
      </section>
    </>
  );
}
