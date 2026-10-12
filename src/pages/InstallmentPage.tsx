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
        <SuccessForm buttonLabel="Submit Installment Enquiry" successIntent="general">
          <FormField label="Customer name" name="name" required maxLength={120} placeholder="Your full name" />
          <FormField label="Phone number" name="phone" required maxLength={32} placeholder="Your contact number" />
          <FormField label="Preferred iPhone model" name="model" required maxLength={160} placeholder="The model you're interested in" />
          <FormField label="Preferred storage" name="storage" options={["64GB", "128GB", "256GB", "512GB", "1TB", "Not sure"]} />
          <FormField label="Preferred colour" name="colour" maxLength={80} placeholder="Colour, if you have one in mind" />
          <FormField label="Budget range" name="budget" required maxLength={80} placeholder="Your budget in GH₵" />
          <FormField label="Ghana Card available?" name="ghanaCard" options={["Yes", "No", "Need guidance"]} required />
          <FormField label="Preferred payment arrangement" name="paymentArrangement" maxLength={160} placeholder="Anything you'd like to discuss" />
          <div className="service-booking-wide"><FormField label="Additional information" name="details" textarea maxLength={1600} placeholder="Questions or details for our team" /></div>
        </SuccessForm>
      </ServiceBookingPage>
    </>
  );
}
