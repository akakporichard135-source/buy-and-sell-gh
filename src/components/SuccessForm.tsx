import { useRef, useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import { submitServiceRequest, type ServiceType } from "../services/serviceRequestRepository";
import { buildServiceRequestPayload, serviceRequestSignature } from "../services/serviceRequestPayload";
import { whatsappUrl } from "../utils/whatsapp";

const serviceNames: Record<ServiceType, string> = {
  installment: "Installment Payment",
  repair: "Expert Repairs",
  "trade-in": "Trade-In",
  upgrade: "Upgrade & Save",
  "visa-card": "Visa Card Trading",
  "pre-order": "Pre-Order",
  referral: "Refer a Friend",
  contact: "Contact",
};

export function SuccessForm({ children, serviceType, buttonLabel = "Submit request" }: {
  children: React.ReactNode;
  serviceType: ServiceType;
  buttonLabel?: string;
}) {
  const [reference, setReference] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const attempt = useRef({ signature: "", key: "" });
  const inFlight = useRef(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inFlight.current || reference) return;
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      setError("Please complete the required fields before submitting.");
      form.reportValidity();
      return;
    }
    const fileError = formFileValidationError(form);
    if (fileError) {
      setError(fileError);
      return;
    }

    const formData = new FormData(form);
    const payload = buildServiceRequestPayload(formData, serviceType);
    const signature = serviceRequestSignature(payload);
    if (attempt.current.signature !== signature) attempt.current = { signature, key: crypto.randomUUID() };

    inFlight.current = true;
    setError("");
    setSubmitting(true);
    try {
      const savedReference = await submitServiceRequest({ ...payload, idempotencyKey: attempt.current.key });
      setReference(savedReference);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Request could not be saved. Please try again.");
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  };

  return (
    <form className="rounded-lg border border-black/7 bg-white p-5 shadow-card sm:p-7" noValidate onSubmit={handleSubmit}>
      <div className="grid gap-5 sm:grid-cols-2">{children}</div>
      <input
        name="website"
        type="text"
        autoComplete="off"
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
        style={{ position: "absolute", width: "1px", height: "1px", padding: 0, margin: "-1px", overflow: "hidden", clip: "rect(0, 0, 0, 0)", border: 0 }}
      />
      {error && <p className="form-error mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700" role="alert">{error}</p>}
      <button className="btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto" type="submit" disabled={submitting || Boolean(reference)}>
        <Send size={17} /> {submitting ? "Submitting..." : reference ? "Request submitted" : buttonLabel}
      </button>
      {reference && (
        <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-base font-bold text-emerald-800" role="status" aria-live="polite">
          <p>Your request has been submitted successfully. Our team will review it and contact you.</p>
          <p className="mt-2 text-sm">Reference: {reference}</p>
          <a className="mt-4 inline-flex rounded-full bg-emerald-700 px-5 py-3 text-sm font-black text-white" href={whatsappUrl(`Hello Buy & Sell GH, I submitted a ${serviceNames[serviceType]} request. Reference: ${reference}.`)} target="_blank" rel="noopener noreferrer">
            Continue on WhatsApp (Optional)
          </a>
        </div>
      )}
    </form>
  );
}

function formFileValidationError(form: HTMLFormElement) {
  const files = Array.from(form.querySelectorAll<HTMLInputElement>('input[type="file"]')).flatMap((input) => Array.from(input.files ?? []));
  const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
  if (files.length > 6) return "Select no more than 6 device photos.";
  if (files.some((file) => !allowedTypes.has(file.type))) return "Use JPEG, PNG, WebP or AVIF device photos only.";
  if (files.some((file) => file.size > 5 * 1024 * 1024)) return "Each device photo must be 5MB or smaller.";
  if (files.reduce((total, file) => total + file.size, 0) > 20 * 1024 * 1024) return "Selected device photos must total 20MB or less.";
  return "";
}
