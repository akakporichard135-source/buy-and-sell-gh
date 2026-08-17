import { ClipboardCheck, MessageCircle } from "lucide-react";
import { FormField } from "../components/FormField";
import { SEO } from "../components/SEO";
import { SuccessForm } from "../components/SuccessForm";
import { WhatsAppButton } from "../components/WhatsAppButton";

export function SellTradePage() {
  return (
    <>
      <SEO title="Sell or Trade In Your Phone" description="Submit your iPhone or gadget trade-in details to Buy & Sell GH. Final price is confirmed after inspection." />
      <section className="page-hero sell-trade-hero">
        <p className="eyebrow-dark">Sell or Trade In</p>
        <h1>Turn your current phone into your next upgrade</h1>
        <p>Final price is confirmed only after physical inspection at Buy & Sell GH.</p>
      </section>
      <section className="section sell-trade-layout">
        <div className="sell-trade-main grid gap-4">
          <div className="trade-inspection-note">
            <ClipboardCheck size={22} />
            <div>
              <h2>Inspection required before final value</h2>
              <p>Photos and form details help with an estimate. The final trade-in value is confirmed only after Buy & Sell GH physically checks the device, battery, Face ID, screen, body, repairs and accessories.</p>
            </div>
          </div>
          <SuccessForm buttonLabel="Prepare trade-in details" successIntent="trade">
            <FormField label="Customer name" name="name" required maxLength={120} />
            <FormField label="Phone number" name="phone" required maxLength={32} />
            <FormField label="Email (optional)" name="email" type="email" maxLength={254} />
            <FormField label="Device brand" name="brand" required maxLength={80} />
            <FormField label="Device model" name="model" required maxLength={160} />
            <FormField label="Storage" name="storage" options={["64GB", "128GB", "256GB", "512GB", "1TB"]} />
            <FormField label="Colour" name="color" maxLength={80} />
            <FormField label="Condition" name="condition" options={["Excellent", "Very Good", "Good", "Faulty"]} />
            <FormField label="Battery health" name="battery" placeholder="Example: 88%" maxLength={20} />
            <FormField label="Face ID status" name="faceId" options={["Working", "Not working", "Not applicable"]} />
            <FormField label="Screen condition" name="screen" options={["Clean", "Scratched", "Cracked", "Replaced"]} />
            <FormField label="Back-glass condition" name="back" options={["Clean", "Scratched", "Cracked", "Replaced"]} />
            <FormField label="Camera condition" name="camera" options={["Working", "Faulty"]} />
            <FormField label="Repair history" name="repair" maxLength={500} />
            <FormField label="Network status" name="network" options={["Unlocked", "Locked", "Not sure"]} />
            <FormField label="Accessories included" name="accessories" maxLength={500} />
            <FormField label="Desired action" name="action" options={["Sell", "Swap"]} />
            <FormField label="Desired replacement phone" name="replacement" maxLength={160} />
            <FormField label="Expected price" name="expected" maxLength={80} />
            <label className="sell-trade-upload block text-sm font-black text-ink">
              Upload device photos
              <input
                className="mt-2 w-full rounded-lg border border-black/10 bg-white px-4 py-3.5 text-base font-semibold text-ink outline-none transition focus:border-gold focus:ring-4 focus:ring-gold/15"
                name="images"
                type="file"
                accept="image/*"
                multiple
              />
              <span>Upload clear photos of the front, back, sides and screen. You can select multiple photos.</span>
            </label>
            <FormField label="Additional details" name="details" textarea maxLength={2000} />
          </SuccessForm>
        </div>
        <aside className="sell-trade-whatsapp rounded-lg border border-black/7 bg-ink p-6 text-white shadow-card">
          <MessageCircle className="text-gold" />
          <h2 className="mt-4 text-2xl font-black">Prefer WhatsApp?</h2>
          <p className="mt-3 text-sm leading-7 text-white/70">Send your device details and photos directly. The inspection note still applies.</p>
          <WhatsAppButton intent="trade" className="mt-6 w-full">Trade-in WhatsApp</WhatsAppButton>
        </aside>
      </section>
    </>
  );
}
