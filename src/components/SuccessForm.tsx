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
  return (
    <form
      className="rounded-lg border border-black/7 bg-white p-5 shadow-card sm:p-7"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">{children}</div>
      <button className="btn-primary mt-6 w-full sm:w-auto" type="submit">
        <Send size={17} /> {buttonLabel}
      </button>
      {submitted && (
        <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-base font-bold text-emerald-800">
          Your details have been captured. Continue on WhatsApp so Buy & Sell GH can confirm availability and next steps.
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
