import {
  Building2,
  CheckCircle2,
  Clock,
  CreditCard,
  Globe,
  MapPin,
  Phone,
  Server,
  Shield,
  Truck,
} from "lucide-react";
import { business } from "../../config/business";

export function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      {/* 1. Header Card */}
      <div className="admin-header-card">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#d4af37]">
              Store Configuration
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300" />
            <span className="text-xs font-semibold text-slate-500">Business Profile</span>
          </div>
          <h2>Business &amp; Operations Settings</h2>
          <p>
            Review verified store information, operating contact lines, delivery zones, and hosting
            infrastructure.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Identity */}
        <div className="admin-card space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Building2 size={18} className="text-[#d4af37]" />
            <h3 className="font-bold text-slate-900 text-sm">Store Information</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Business Name</span>
              <span className="font-bold text-slate-900">{business.name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Tagline</span>
              <span className="font-semibold text-slate-700">{business.tagline}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Physical Location</span>
              <span className="font-bold text-slate-900 flex items-center gap-1">
                <MapPin size={13} className="text-rose-500" />
                {business.location}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Primary Store Phone</span>
              <span className="font-bold text-slate-900">{business.phones[0]}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Secondary Store Phone</span>
              <span className="font-bold text-slate-900">{business.phones[1]}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500 font-medium">WhatsApp Business Line</span>
              <span className="font-bold text-emerald-700">+{business.whatsapp.primary}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500 font-medium">Public Storefront Domain</span>
              <a
                href={business.siteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-[#d4af37] hover:underline"
              >
                {business.siteUrl}
              </a>
            </div>
          </div>
        </div>

        {/* Operating Hours & Fulfilment */}
        <div className="admin-card space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Clock size={18} className="text-[#d4af37]" />
            <h3 className="font-bold text-slate-900 text-sm">Operating Hours &amp; Fulfilment</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Monday &ndash; Saturday</span>
              <span className="font-bold text-slate-900">8:30 AM &ndash; 7:00 PM</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Sunday</span>
              <span className="font-bold text-amber-700">On-Call / By Appointment</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Greater Accra Delivery</span>
              <span className="font-bold text-emerald-700">Same-Day Dispatch via Courier</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500 font-medium">In-Store Pickup</span>
              <span className="font-bold text-slate-900">Available during operating hours</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500 font-medium">Nationwide Shipping (Ghana)</span>
              <span className="font-bold text-slate-900">VIP / Express Bus Parcel Service</span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="admin-card space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <CreditCard size={18} className="text-[#d4af37]" />
            <h3 className="font-bold text-slate-900 text-sm">Payment Methods</h3>
          </div>

          <div className="space-y-2 text-xs text-slate-700">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-amber-500 mt-1 shrink-0" />
              <div>
                <strong className="text-slate-900 block">MTN Mobile Money &amp; Telecel Cash</strong>
                <span>Official merchant payment details provided during WhatsApp checkout confirmation.</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
              <div>
                <strong className="text-slate-900 block">Pay on Delivery (Accra Only)</strong>
                <span>Available for verified orders with verified delivery address in Greater Accra.</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-sky-500 mt-1 shrink-0" />
              <div>
                <strong className="text-slate-900 block">In-Store Cash / POS</strong>
                <span>Accepted for direct customer purchases and physical trade-in pickups at the shop.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Infrastructure & Security Status */}
        <div className="admin-card space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Server size={18} className="text-[#d4af37]" />
            <h3 className="font-bold text-slate-900 text-sm">Hosting &amp; Security Architecture</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Edge Hosting Network</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 size={13} /> Vercel Edge CDN (Active)
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Database Layer</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 size={13} /> Supabase PostgreSQL (RLS Enforced)
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Administrative Isolation</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 size={13} /> admin.buyandsellgh.com (Active)
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500 font-medium">Public /admin Route</span>
              <span className="font-bold text-slate-900">HTTP 404 Masking Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
