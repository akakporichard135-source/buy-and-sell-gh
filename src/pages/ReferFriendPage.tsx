import { Share2 } from "lucide-react";
import { useCms } from "../cms/CmsContext";
import { defaultPageContent } from "../cms/defaultCmsData";
import { FormField } from "../components/FormField";
import { SEO } from "../components/SEO";
import { SuccessForm } from "../components/SuccessForm";
import { WhatsAppButton } from "../components/WhatsAppButton";
import defaultReferralCampaign from "../assets/homepage/owner-refer-friend.jpg";

export function ReferFriendPage() {
  const { pages } = useCms();
  const referral = pages?.referral || defaultPageContent.referral;

  const title = referral?.title || "Refer a Friend";
  const eyebrow = referral?.eyebrow || "Refer a Friend";
  const heading = referral?.heading || "Good tech is better when shared.";
  const subtitle =
    referral?.subtitle ||
    "Send a simple referral enquiry for someone looking for a device, repair, trade-in or pre-order.";
  const image = referral?.image || defaultReferralCampaign;
  const sideCardHeading = referral?.sideCardHeading || "Referral note";
  const sideCardText =
    referral?.sideCardText ||
    "No reward or discount is promised here unless Buy & Sell GH confirms a current offer directly.";
  const whatsappLabel = referral?.whatsappLabel || "Referral WhatsApp";

  return (
    <>
      <SEO
        title={title}
        description="Refer someone to Buy & Sell GH for phones, repairs, trade-ins, pre-orders and tech support."
      />
      <section className="service-hero service-hero-light">
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
        <SuccessForm serviceType="referral" buttonLabel="Submit Referral">
          <FormField label="Your name" name="yourName" required maxLength={120} />
          <FormField label="Your phone number" name="yourPhone" required maxLength={32} />
          <FormField label="Friend's name" name="friendName" required maxLength={120} />
          <FormField label="Friend's phone number" name="friendPhone" required maxLength={32} />
          <FormField
            label="What do they need?"
            name="interest"
            options={["Buy a device", "Sell or trade", "Repair", "Pre-order", "Gift card enquiry", "Not sure"]}
            required
          />
          <FormField label="Additional note" name="details" textarea maxLength={1200} />
        </SuccessForm>
        <aside className="service-side-card">
          <Share2 size={24} />
          <h2>{sideCardHeading}</h2>
          <p>{sideCardText}</p>
          <WhatsAppButton className="mt-6 w-full">{whatsappLabel}</WhatsAppButton>
        </aside>
      </section>
    </>
  );
}
