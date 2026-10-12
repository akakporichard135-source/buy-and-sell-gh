import { FormField } from "../components/FormField";
import { SEO } from "../components/SEO";
import { ServiceBookingPage, ServicePhotoField } from "../components/ServiceBookingPage";
import { SuccessForm } from "../components/SuccessForm";

export function RepairsPage() {
  return (
    <>
      <SEO title="Book a Device Repair" description="Tell Buy & Sell GH about your device and repair issue. Our team will help you with the next steps." />
      <ServiceBookingPage
        category="Repairs"
        title="Book a Device Repair"
        description="Tell us about your device and the issue you're experiencing. Our team will help you with the next steps."
        guidance="Repair pricing and completion timing depend on inspecting the device and identifying the issue. Our team will confirm the next steps with you."
        assistance="Have a question before preparing your repair enquiry? Speak with the Buy & Sell GH team directly."
      >
        <SuccessForm buttonLabel="Prepare Repair Enquiry" successIntent="general">
          <FormField label="Customer name" name="name" required maxLength={120} placeholder="Your full name" />
          <FormField label="Phone number" name="phone" required maxLength={32} placeholder="Your contact number" />
          <FormField label="Device type" name="deviceType" options={["Mobile phone", "Laptop", "Game console", "Tablet", "Other"]} required />
          <FormField label="Device model" name="model" required maxLength={160} placeholder="Brand and model" />
          <div className="service-booking-wide"><FormField label="Problem summary" name="issue" required textarea maxLength={500} placeholder="What is happening with your device?" /></div>
          <FormField label="Repair history" name="repairHistory" maxLength={500} placeholder="Previous repairs, if any" />
          <FormField label="Preferred visit time" name="visitTime" maxLength={120} placeholder="Day and time that suit you" />
          <div className="service-booking-wide"><FormField label="Additional information" name="details" textarea maxLength={1600} placeholder="Anything else we should know?" /></div>
          <ServicePhotoField />
        </SuccessForm>
      </ServiceBookingPage>
    </>
  );
}
