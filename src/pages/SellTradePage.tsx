import { useSearchParams } from "react-router-dom";
import { useCms } from "../cms/CmsContext";
import { FormField } from "../components/FormField";
import { SEO } from "../components/SEO";
import { ServiceBookingPage, ServicePhotoField } from "../components/ServiceBookingPage";
import { SuccessForm } from "../components/SuccessForm";

export function SellTradePage() {
  const [searchParams] = useSearchParams();
  const isUpgradeMode = searchParams.get("mode") === "upgrade";
  const { pages } = useCms();
  const tradeIn = pages?.tradeIn;

  const title = isUpgradeMode
    ? tradeIn?.upgradeTitle || "Upgrade Your Device"
    : tradeIn?.title || "Sell Your Device";

  const description = isUpgradeMode
    ? tradeIn?.upgradeDescription || "Tell us what you're currently using and what you'd like to upgrade to."
    : tradeIn?.description || "Share your device details and request an assessment from our team.";

  const guidance = isUpgradeMode
    ? tradeIn?.upgradeGuidance ||
      "Your trade-in value is subject to a physical inspection and assessment. Photos and device details help us prepare, but they are not an automatic valuation."
    : tradeIn?.guidance ||
      "The final offer depends on the device's condition and a physical inspection. Details and photos help our team prepare an assessment; they do not guarantee a price.";

  const assistance =
    tradeIn?.assistance ||
    "Want to discuss your device before preparing the form? Send its details and photos directly to our team.";

  return (
    <>
      <SEO
        title={title}
        description={description}
      />
      <ServiceBookingPage
        category={isUpgradeMode ? "Upgrade & Save" : "Sell Your Device"}
        title={title}
        description={description}
        guidance={guidance}
        assistance={assistance}
        intent="trade"
      >
        <SuccessForm buttonLabel={isUpgradeMode ? "Request Upgrade Assessment" : "Request Device Valuation"} successIntent="trade">
          <FormField label="Customer name" name="name" required maxLength={120} placeholder="Your full name" />
          <FormField label="Phone number" name="phone" required maxLength={32} placeholder="Your contact number" />
          <FormField label="Device type" name="deviceType" options={["Mobile phone", "Tablet", "Laptop", "Game console", "Other"]} />
          <FormField label="Device brand" name="brand" required maxLength={80} placeholder="Brand of your current device" />
          <FormField label="Device model" name="model" required maxLength={160} placeholder="Model of your current device" />
          <FormField label="Storage" name="storage" options={["64GB", "128GB", "256GB", "512GB", "1TB"]} />
          <FormField label="Condition" name="condition" options={["Excellent", "Very Good", "Good", "Faulty"]} />
          <FormField label="Desired action" name="action" options={["Sell", "Swap"]} defaultValue={isUpgradeMode ? "Swap" : "Sell"} />
          {isUpgradeMode && <FormField label="Preferred new device" name="replacement" maxLength={160} placeholder="What would you like to upgrade to?" />}
          <div className="service-booking-wide"><FormField label="Known issues" name="issues" textarea maxLength={600} placeholder="Describe any faults or damage" /></div>
          <ServicePhotoField />
          <div className="service-booking-wide"><FormField label="Additional information" name="details" textarea maxLength={2000} placeholder="Anything else that would help our team assess your device?" /></div>
          <details className="service-booking-more">
            <summary>More device details <span>Optional</span></summary>
            <div className="service-booking-more-grid">
              <FormField label="Email" name="email" type="email" maxLength={254} placeholder="Optional email address" />
              <FormField label="Colour" name="color" maxLength={80} />
              <FormField label="Battery health" name="battery" placeholder="Example: 88%" maxLength={20} />
              <FormField label="Face ID status" name="faceId" options={["Working", "Not working", "Not applicable"]} />
              <FormField label="Screen condition" name="screen" options={["Clean", "Scratched", "Cracked", "Replaced"]} />
              <FormField label="Back-glass condition" name="back" options={["Clean", "Scratched", "Cracked", "Replaced"]} />
              <FormField label="Camera condition" name="camera" options={["Working", "Faulty"]} />
              <FormField label="Repair history" name="repair" maxLength={500} />
              <FormField label="Network status" name="network" options={["Unlocked", "Locked", "Not sure"]} />
              <FormField label="Accessories included" name="accessories" maxLength={500} />
              {!isUpgradeMode && <FormField label="Desired replacement phone" name="replacement" maxLength={160} />}
              <FormField label="Expected price" name="expected" maxLength={80} />
            </div>
          </details>
        </SuccessForm>
      </ServiceBookingPage>
    </>
  );
}
