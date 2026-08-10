import { ClipboardCheck, MessageCircle } from "lucide-react";
import { FormField } from "../components/FormField";
import { SEO } from "../components/SEO";
import { SuccessForm } from "../components/SuccessForm";
import { WhatsAppButton } from "../components/WhatsAppButton";

export function SellTradePage() {
  return (
    <>
      <SEO title="Sell or Trade In Your Phone" description="Submit your iPhone or gadget trade-in details to Buy & Sell GH. Final price is confirmed after inspection." />
      <section className="page-hero">
        <p className="eyebrow-dark">Sell or Trade In</p>
        <h1>Turn your current phone into your next upgrade</h1>
        <p>Final price is confirmed only after physical inspection at Buy & Sell GH.</p>
      </section>
      <section className="section grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-4">
          <div className="trade-inspection-note">
            <ClipboardCheck size={22} />
            <div>
              <h2>Inspection required before final value</h2>
              <p>Photos and form details help with an estimate. The final trade-in value is confirmed only after Buy & Sell GH physically checks the device, battery, Face ID, screen, body, repairs and accessories.</p>
            </div>
          </div>
          <SuccessForm buttonLabel="Submit trade-in details">
            <FormField label="Customer name" name="name" required />
            <FormField label="Phone number" name="phone" required />
            <FormField label="Email (optional)" name="email" type="email" />
            <FormField label="Device brand" name="brand" required />
            <FormField label="Device model" name="model" required />
            <FormField label="Storage" name="storage" options={["64GB", "128GB", "256GB", "512GB", "1TB"]} />
            <FormField label="Colour" name="color" />
            <FormField label="Condition" name="condition" options={["Excellent", "Very Good", "Good", "Faulty"]} />
            <FormField label="Battery health" name="battery" placeholder="Example: 88%" />
            <FormField label="Face ID status" name="faceId" options={["Working", "Not working", "Not applicable"]} />
            <FormField label="Screen condition" name="screen" options={["Clean", "Scratched", "Cracked", "Replaced"]} />
            <FormField label="Back-glass condition" name="back" options={["Clean", "Scratched", "Cracked", "Replaced"]} />
            <FormField label="Camera condition" name="camera" options={["Working", "Faulty"]} />
            <FormField label="Repair history" name="repair" />
            <FormField label="Network status" name="network" options={["Unlocked", "Locked", "Not sure"]} />
            <FormField label="Accessories included" name="accessories" />
            <FormField label="Desired action" name="action" options={["Sell", "Swap"]} />
            <FormField label="Desired replacement phone" name="replacement" />
            <FormField label="Expected price" name="expected" />
            <FormField label="Upload device photos" name="images" type="file" />
            <FormField label="Additional details" name="details" textarea />
          </SuccessForm>
        </div>
        <aside className="rounded-lg border border-black/7 bg-ink p-6 text-white shadow-card">
          <MessageCircle className="text-gold" />
          <h2 className="mt-4 text-2xl font-black">Prefer WhatsApp?</h2>
          <p className="mt-3 text-sm leading-7 text-white/70">Send your device details and photos directly. The inspection note still applies.</p>
          <WhatsAppButton intent="trade" className="mt-6 w-full">Trade-in WhatsApp</WhatsAppButton>
        </aside>
      </section>
    </>
  );
}
