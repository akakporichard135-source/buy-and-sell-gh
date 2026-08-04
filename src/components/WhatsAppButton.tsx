import { MessageCircle } from "lucide-react";
import { intentWhatsAppUrl, type WhatsAppIntent } from "../utils/whatsapp";

interface WhatsAppButtonProps {
  intent?: WhatsAppIntent;
  href?: string;
  children?: React.ReactNode;
  className?: string;
}

export function WhatsAppButton({ intent = "general", href, children = "WhatsApp", className = "" }: WhatsAppButtonProps) {
  return (
    <a
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-extrabold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-emerald-700 ${className}`}
      href={href ?? intentWhatsAppUrl(intent)}
      target="_blank"
      rel="noreferrer"
    >
      <MessageCircle size={18} />
      {children}
    </a>
  );
}
