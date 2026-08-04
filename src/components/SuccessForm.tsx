import { useState } from "react";
import { Send } from "lucide-react";

export function SuccessForm({
  children,
  buttonLabel = "Submit request",
  successActionHref,
  successActionLabel = "Continue on WhatsApp",
}: {
  children: React.ReactNode;
  buttonLabel?: string;
  successActionHref?: string;
  successActionLabel?: string;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  return (
    <form
      className="rounded-lg border border-black/7 bg-white p-5 shadow-card sm:p-7"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        if (!form.checkValidity()) {
          setSubmitted(false);
          setError("Please complete the required fields before submitting.");
          form.reportValidity();
          return;
        }
        setError("");
        setSubmitting(true);
        window.setTimeout(() => {
          setSubmitting(false);
          setSubmitted(true);
        }, 350);
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">{children}</div>
      {error && <p className="form-error mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}
      <button className="btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto" type="submit" disabled={submitting}>
        <Send size={17} /> {submitting ? "Sending..." : buttonLabel}
      </button>
      {submitted && (
        <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-base font-bold text-emerald-800">
          Your details are ready. Continue on WhatsApp so Buy & Sell GH can confirm availability and next steps.
          {successActionHref && (
            <a className="mt-4 inline-flex rounded-full bg-emerald-700 px-5 py-3 text-sm font-black text-white" href={successActionHref} target="_blank" rel="noreferrer">
              {successActionLabel}
            </a>
          )}
        </div>
      )}
    </form>
  );
}
