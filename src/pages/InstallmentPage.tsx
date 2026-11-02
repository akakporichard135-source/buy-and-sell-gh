import { useMemo, useState } from "react";
import { useCms } from "../cms/CmsContext";
import { defaultPageContent } from "../cms/defaultCmsData";
import { FormField } from "../components/FormField";
import { SEO } from "../components/SEO";
import { ServiceBookingPage } from "../components/ServiceBookingPage";
import { SuccessForm } from "../components/SuccessForm";

export function InstallmentPage() {
  const { pages } = useCms();
  const config = pages?.installment || defaultPageContent.installment;

  const title = config?.title || "Apply for an Installment Plan";
  const description =
    config?.description ||
    "Interested in purchasing a device through installments? Send us your details to discuss available options.";
  const guidance =
    config?.guidance ||
    "The advertised iPhone plan requires 40% upfront and a Ghana Card. Availability, eligibility and payment details are confirmed by Buy & Sell GH; this enquiry is not an approval. Never send passwords or PINs.";
  const assistance =
    config?.assistance ||
    "Questions about the current plan or a device? Contact the team before preparing your enquiry.";
  const depositPct = config?.depositPercentage ?? 40;
  const depositLabel =
    config?.depositLabel || `Can you meet the advertised ${depositPct}% initial deposit?`;
  const planHeading = config?.planHeading || "Preferred Installment Plan";
  const planNotice =
    config?.planNotice ||
    `The current advertised plan asks for a ${depositPct}% initial deposit. Your preference does not change this requirement.`;
  const planDurations =
    config?.planDurations && config.planDurations.length > 0
      ? config.planDurations
      : ["2 weeks", "4 weeks", "6 weeks", "8 weeks", "12 weeks", "Other / Discuss with team"];
  const paymentFrequencies =
    config?.paymentFrequencies && config.paymentFrequencies.length > 0
      ? config.paymentFrequencies
      : ["Weekly", "Every 2 weeks", "Discuss with team"];
  const ghanaCardOptions =
    config?.ghanaCardOptions && config.ghanaCardOptions.length > 0
      ? config.ghanaCardOptions
      : ["Yes", "No", "Need guidance"];
  const disclaimer =
    config?.disclaimer ||
    "Our team will confirm the payment schedule and total cost. Submitting this request does not guarantee approval. Final payment terms and eligibility will be confirmed by Buy & Sell GH.";

  // Dynamic user selections for schedule estimation
  const [selectedDuration, setSelectedDuration] = useState<string>("8 weeks");
  const [selectedFrequency, setSelectedFrequency] = useState<string>("Weekly");
  const [budgetInput, setBudgetInput] = useState<string>("");

  // Calculate payment count logic
  const scheduleEstimate = useMemo(() => {
    const match = selectedDuration.match(/(\d+)\s*weeks?/i);
    if (!match) return null;
    const weeks = parseInt(match[1], 10);
    if (isNaN(weeks) || weeks <= 0) return null;

    let installmentCount = 0;
    let frequencyText = "";

    if (/weekly/i.test(selectedFrequency) && !/every 2/i.test(selectedFrequency)) {
      installmentCount = weeks;
      frequencyText = "weekly";
    } else if (/every 2\s*weeks?/i.test(selectedFrequency) || /bi-?weekly/i.test(selectedFrequency)) {
      installmentCount = Math.max(1, Math.round(weeks / 2));
      frequencyText = "bi-weekly (every 2 weeks)";
    } else {
      return {
        weeks,
        isCustom: true,
        summary: `Custom schedule over ${weeks} weeks to be agreed directly with Buy & Sell GH.`,
      };
    }

    const cleanBudget = parseFloat(budgetInput.replace(/[^\d.]/g, ""));
    let depositEstimate: number | null = null;
    let installmentEstimate: number | null = null;

    if (!isNaN(cleanBudget) && cleanBudget > 0) {
      depositEstimate = Math.round((cleanBudget * depositPct) / 100);
      const remaining = cleanBudget - depositEstimate;
      installmentEstimate = Math.round(remaining / installmentCount);
    }

    return {
      weeks,
      installmentCount,
      frequencyText,
      isCustom: false,
      depositEstimate,
      installmentEstimate,
    };
  }, [selectedDuration, selectedFrequency, budgetInput, depositPct]);

  return (
    <>
      <SEO title={title} description={description} />
      <ServiceBookingPage
        category="Installment Payment"
        title={title}
        description={description}
        guidance={guidance}
        assistance={assistance}
      >
        <SuccessForm serviceType="installment" buttonLabel="Submit Installment Enquiry">
          <FormField
            label="Customer name"
            name="name"
            required
            maxLength={120}
            placeholder="Your full name"
          />
          <FormField
            label="Phone number"
            name="phone"
            required
            maxLength={32}
            placeholder="Your contact number"
          />
          <FormField
            label="Preferred iPhone model"
            name="model"
            required
            maxLength={160}
            placeholder="The model you're interested in"
          />
          <FormField
            label="Preferred storage"
            name="storage"
            options={["64GB", "128GB", "256GB", "512GB", "1TB", "Not sure"]}
          />
          <FormField
            label="Preferred colour"
            name="colour"
            maxLength={80}
            placeholder="Colour, if you have one in mind"
          />
          <FormField
            label="Budget range (GH₵)"
            name="budget"
            required
            maxLength={80}
            placeholder="Your budget in GH₵ (e.g. 4000)"
            value={budgetInput}
            onChange={(e) => setBudgetInput(e.target.value)}
          />
          <FormField
            label="Ghana Card available?"
            name="ghanaCard"
            options={ghanaCardOptions}
            required
          />

          <div className="service-booking-wide border-t border-slate-200 pt-5">
            <h2 className="text-lg font-semibold text-[#1d1d1f]">{planHeading}</h2>
            <p className="mt-1 text-sm text-slate-600">{planNotice}</p>
          </div>

          <FormField
            label="Plan duration"
            name="planDuration"
            options={planDurations}
            value={selectedDuration}
            onChange={(e) => setSelectedDuration(e.target.value)}
            required
          />
          <FormField
            label="Payment frequency"
            name="paymentFrequency"
            options={paymentFrequencies}
            value={selectedFrequency}
            onChange={(e) => setSelectedFrequency(e.target.value)}
            required
          />

          {/* Dynamic Payment Schedule Guidance Preview */}
          <div className="service-booking-wide rounded-xl border border-amber-200/80 bg-amber-50/60 p-4 text-xs text-amber-950 sm:text-sm">
            <div className="flex items-center gap-2 font-bold text-amber-900 mb-1">
              <span>Payment Count &amp; Schedule Breakdown</span>
            </div>
            {scheduleEstimate ? (
              scheduleEstimate.isCustom ? (
                <p>{scheduleEstimate.summary}</p>
              ) : (
                <div className="space-y-1">
                  <p>
                    <strong>Schedule:</strong> {scheduleEstimate.installmentCount}{" "}
                    {scheduleEstimate.frequencyText} payments over {scheduleEstimate.weeks} weeks (after the {depositPct}% initial deposit).
                  </p>
                  {scheduleEstimate.depositEstimate != null && (
                    <p className="text-slate-700">
                      <strong>Budget Estimate:</strong> ~GH₵ {scheduleEstimate.depositEstimate.toLocaleString()} initial deposit ({depositPct}%), then ~GH₵ {scheduleEstimate.installmentEstimate?.toLocaleString()} per payment.
                    </p>
                  )}
                  <p className="text-[0.75rem] text-slate-500 pt-1">
                    Actual prices and payment details are confirmed by Buy &amp; Sell GH upon device inspection and stock check.
                  </p>
                </div>
              )
            ) : (
              <p>
                Select your preferred duration and frequency above to see your estimated payment count.
              </p>
            )}
          </div>

          <FormField
            label={depositLabel}
            name="depositPreference"
            options={["Yes", "No", "Discuss with team"]}
            required
          />
          <FormField
            label="Preferred payment arrangement"
            name="paymentArrangement"
            maxLength={160}
            placeholder="Anything you'd like to discuss (e.g. pay on delivery for deposit)"
          />

          <div className="service-booking-wide">
            <FormField
              label="Additional information"
              name="details"
              textarea
              maxLength={1600}
              placeholder="Questions or details for our team"
            />
          </div>

          <p className="service-booking-wide text-sm text-slate-600">{disclaimer}</p>
        </SuccessForm>
      </ServiceBookingPage>
    </>
  );
}
