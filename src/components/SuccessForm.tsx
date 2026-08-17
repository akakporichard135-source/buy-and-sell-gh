import { useState } from "react";
import { Send } from "lucide-react";
import { whatsappUrl, type WhatsAppIntent } from "../utils/whatsapp";

export function SuccessForm({
  children,
  buttonLabel = "Submit request",
  successActionHref,
  successIntent,
  successActionLabel = "Continue on WhatsApp",
}: {
  children: React.ReactNode;
  buttonLabel?: string;
  successActionHref?: string;
  successIntent?: WhatsAppIntent;
  successActionLabel?: string;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [preparedHref, setPreparedHref] = useState(successActionHref ?? "");

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
        const fileError = formFileValidationError(form);
        if (fileError) {
          setSubmitted(false);
          setError(fileError);
          return;
        }
        setError("");
        setSubmitting(true);
        const formData = new FormData(form);
        setPreparedHref(successActionHref ?? (successIntent ? formRequestWhatsAppUrl(formData, successIntent, buttonLabel) : ""));
        window.setTimeout(() => {
          setSubmitting(false);
          setSubmitted(true);
        }, 350);
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">{children}</div>
      {error && <p className="form-error mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}
      <button className="btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto" type="submit" disabled={submitting}>
        <Send size={17} /> {submitting ? "Preparing..." : buttonLabel}
      </button>
      {submitted && (
        <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-base font-bold text-emerald-800" role="status" aria-live="polite">
          Your details are ready but have not been sent yet. Continue on WhatsApp so Buy & Sell GH can receive the request and confirm next steps.
          {preparedHref && (
            <a className="mt-4 inline-flex rounded-full bg-emerald-700 px-5 py-3 text-sm font-black text-white" href={preparedHref} target="_blank" rel="noopener noreferrer">
              {successActionLabel}
            </a>
          )}
        </div>
      )}
    </form>
  );
}

const requestIntroductions: Record<WhatsAppIntent, string> = {
  general: "Hello Buy & Sell GH, I completed the contact form on your website.",
  product: "Hello Buy & Sell GH, I completed a product enquiry on your website.",
  trade: "Hello Buy & Sell GH, I completed the sell or trade form on your website.",
  request: "Hello Buy & Sell GH, I completed the pre-order form on your website.",
  delivery: "Hello Buy & Sell GH, I completed a delivery enquiry on your website.",
};

function formRequestWhatsAppUrl(formData: FormData, intent: WhatsAppIntent, requestLabel: string) {
  const lines = [requestIntroductions[intent], "", `${requestLabel}:`];
  let selectedPhotos = 0;

  for (const [name, value] of formData.entries()) {
    if (value instanceof File) {
      if (value.size > 0) selectedPhotos += 1;
      continue;
    }
    const cleanValue = sanitizeMessageValue(value);
    if (cleanValue) lines.push(`${formatFieldName(name)}: ${cleanValue}`);
  }

  if (selectedPhotos > 0) lines.push(`Photos selected: ${selectedPhotos} (I will attach them in this chat.)`);
  lines.push("", "Please confirm the next steps.");
  return whatsappUrl(lines.join("\n"));
}

function formFileValidationError(form: HTMLFormElement) {
  const files = Array.from(form.querySelectorAll<HTMLInputElement>('input[type="file"]')).flatMap((input) => Array.from(input.files ?? []));
  const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
  const maxFileBytes = 5 * 1024 * 1024;
  const maxTotalBytes = 20 * 1024 * 1024;

  if (files.length > 6) return "Select no more than 6 device photos.";
  if (files.some((file) => !allowedTypes.has(file.type))) return "Use JPEG, PNG, WebP or AVIF device photos only.";
  if (files.some((file) => file.size > maxFileBytes)) return "Each device photo must be 5MB or smaller.";
  if (files.reduce((total, file) => total + file.size, 0) > maxTotalBytes) return "Selected device photos must total 20MB or less.";
  return "";
}

export const sanitizeMessageValue = (value: string) => value
  .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ")
  .trim();

function formatFieldName(name: string) {
  return name
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .replace(/^./, (character) => character.toUpperCase());
}
