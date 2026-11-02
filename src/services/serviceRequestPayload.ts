import type { ServiceType } from "./serviceRequestRepository";

export function buildServiceRequestPayload(formData: FormData, serviceType: ServiceType) {
  const name = clean(formData.get("name") ?? formData.get("yourName"));
  const phone = clean(formData.get("phone") ?? formData.get("yourPhone"));
  const details: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (key === "name" || key === "yourName" || key === "phone" || key === "yourPhone" || key === "website" || value instanceof File) continue;
    const text = clean(value);
    if (text) details[key] = text;
  }
  return { type: serviceType, name, phone, details, honeypot: clean(formData.get("website")) };
}

export function serviceRequestSignature(payload: ReturnType<typeof buildServiceRequestPayload>) {
  return JSON.stringify({ type: payload.type, name: payload.name, phone: payload.phone, details: payload.details });
}

const clean = (value: FormDataEntryValue | null) => typeof value === "string"
  ? value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ").trim()
  : "";
