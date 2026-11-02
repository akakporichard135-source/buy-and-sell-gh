import { FormField } from "../components/FormField";
import { SEO } from "../components/SEO";
import { ServiceBookingPage } from "../components/ServiceBookingPage";
import { SuccessForm } from "../components/SuccessForm";

export function InstallmentPage() {
  return (
    <>
      <SEO title="Apply for an Installment Plan" description="Send Buy & Sell GH your details to discuss available iPhone installment options." />
      <ServiceBookingPage
        category="Installment Payment"
        title="Apply for an Installment Plan"
        description="Interested in purchasing a device through installments? Send us your details to discuss available options."
        guidance="The advertised iPhone plan requires 40% upfront and a Ghana Card. Availability, eligibility and payment details are confirmed by Buy & Sell GH; this enquiry is not an approval. Never send passwords or PINs."
        assistance="Questions about the current plan or a device? Contact the team before preparing your enquiry."
      >
        <SuccessForm serviceType="installment" buttonLabel="Submit Installment Enquiry">
          <FormField label="Customer name" name="name" required maxLength={120} placeholder="Your full name" />
          <FormField label="Phone number" name="phone" required maxLength={32} placeholder="Your contact number" />
          <FormField label="Preferred iPhone model" name="model" required maxLength={160} placeholder="The model you're interested in" />
          <FormField label="Preferred storage" name="storage" options={["64GB", "128GB", "256GB", "512GB", "1TB", "Not sure"]} />
          <FormField label="Preferred colour" name="colour" maxLength={80} placeholder="Colour, if you have one in mind" />
          <FormField label="Budget range" name="budget" required maxLength={80} placeholder="Your budget in GH₵" />
          <FormField label="Ghana Card available?" name="ghanaCard" options={["Yes", "No", "Need guidance"]} required />
          <div className="service-booking-wide border-t border-slate-200 pt-5">
            <h2 className="text-lg font-semibold text-[#1d1d1f]">Preferred Installment Plan</h2>
            <p className="mt-1 text-sm text-slate-600">The current advertised plan asks for a 40% initial deposit. Your preference does not change this requirement.</p>
          </div>
          <FormField label="Plan duration" name="planDuration" options={["2 weeks", "4 weeks", "6 weeks", "8 weeks", "12 weeks", "Other / Discuss with team"]} required />
          <FormField label="Payment frequency" name="paymentFrequency" options={["Weekly", "Every 2 weeks", "Discuss with team"]} required />
          <FormField label="Can you meet the advertised 40% initial deposit?" name="depositPreference" options={["Yes", "No", "Discuss with team"]} required />
          <FormField label="Preferred payment arrangement" name="paymentArrangement" maxLength={160} placeholder="Anything you'd like to discuss" />
          <div className="service-booking-wide"><FormField label="Additional information" name="details" textarea maxLength={1600} placeholder="Questions or details for our team" /></div>
          <p className="service-booking-wide text-sm text-slate-600">Our team will confirm the payment schedule and total cost. Submitting this request does not guarantee approval. Final payment terms and eligibility will be confirmed by Buy &amp; Sell GH.</p>
        </SuccessForm>
      </ServiceBookingPage>
    </>
  );
}
