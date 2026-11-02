import { useSearchParams } from "react-router-dom";
import { useCms } from "../cms/CmsContext";
import { defaultPageContent } from "../cms/defaultCmsData";
import { FormField } from "../components/FormField";
import { SEO } from "../components/SEO";
import { SuccessForm } from "../components/SuccessForm";
import { WhatsAppButton } from "../components/WhatsAppButton";
import defaultPreOrderArtwork from "../assets/homepage/homepage-preorder-premium.jpg";
import "../styles/service-experience.css";

export function DeviceRequestPage() {
  const [searchParams] = useSearchParams();
  const requestedModel = searchParams.get("model")?.trim() ?? "";
  const requestedStorage = searchParams.get("storage")?.trim() ?? "";
  const requestedColor = searchParams.get("color")?.trim() ?? "";

  const { pages } = useCms();
  const preOrder = pages?.preOrder || defaultPageContent.preOrder;

  const title = preOrder?.title || "Pre-Order an Apple Device";
  const eyebrow = preOrder?.eyebrow || "Pre-Order";
  const heading = preOrder?.heading || "Can't find the device you want?";
  const subtitle =
    preOrder?.subtitle ||
    "This is a sourcing request, not a stock promise. Tell us exactly what you need and Buy & Sell GH will review availability before any payment step.";
  const image = preOrder?.image || defaultPreOrderArtwork;
  const howItWorksHeading = preOrder?.howItWorksHeading || "A request first. Confirmation second.";
  const steps =
    preOrder?.steps && preOrder.steps.length > 0
      ? preOrder.steps
      : [
          "Share the device and preferences.",
          "The team reviews sourcing and current pricing.",
          "You receive confirmed next steps before payment.",
        ];
  const whatsappLabel = preOrder?.whatsappLabel || "Pre-Order on WhatsApp";

  return (
    <div className="service-experience-page preorder-experience">
      <SEO
        title={title}
        description="Pre-order an Apple device that is not currently available on the Buy & Sell GH website."
      />
      <section className="preorder-hero">
        <div>
          <p className="eyebrow-dark">{eyebrow}</p>
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
      <section className="service-request-layout">
        <SuccessForm serviceType="pre-order" buttonLabel="Submit Pre-Order">
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
          <h2>{howItWorksHeading}</h2>
          <ol>
            {steps.map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ol>
          <WhatsAppButton intent="request" className="mt-6 w-full">
            {whatsappLabel}
          </WhatsAppButton>
        </aside>
      </section>
    </div>
  );
}
