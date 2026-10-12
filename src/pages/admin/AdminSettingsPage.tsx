import {
  Bell,
  BookOpen,
  Building2,
  CheckCircle2,
  Clock,
  Code2,
  CreditCard,
  FileText,
  Globe,
  HelpCircle,
  Info,
  MapPin,
  MessageCircle,
  Phone,
  Server,
  Shield,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import { useState } from "react";
import { business } from "../../config/business";

export function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "content" | "policies" | "infrastructure">("profile");

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
            <span className="text-xs font-semibold text-slate-500">Business Command Center</span>
          </div>
          <h2>Business &amp; Operations Settings</h2>
          <p>
            Review store identity, manage customer-facing website copy, inspect business policies,
            and audit hosting infrastructure.
          </p>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-slate-100/80 border border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === "profile"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Building2 size={15} />
          <span>Store Profile &amp; Contact</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("content")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === "content"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Globe size={15} />
          <span>Website Content &amp; Banners</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("policies")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === "policies"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <FileText size={15} />
          <span>Store Policies &amp; Terms</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("infrastructure")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === "infrastructure"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Server size={15} />
          <span>Hosting &amp; Security</span>
        </button>
      </div>

      {/* TAB 1: Store Profile & Contact */}
      {activeTab === "profile" && (
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
          <div className="admin-card space-y-4 lg:col-span-2">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <CreditCard size={18} className="text-[#d4af37]" />
              <h3 className="font-bold text-slate-900 text-sm">Payment Methods</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-700">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                  <strong className="text-slate-900">MTN MoMo &amp; Telecel Cash</strong>
                </div>
                <p className="text-slate-500 leading-relaxed">
                  Official merchant payment details provided during WhatsApp checkout confirmation.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                  <strong className="text-slate-900">Pay on Delivery (Accra)</strong>
                </div>
                <p className="text-slate-500 leading-relaxed">
                  Available for verified orders with confirmed delivery addresses in Greater Accra.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-sky-500 shrink-0" />
                  <strong className="text-slate-900">In-Store Cash / POS</strong>
                </div>
                <p className="text-slate-500 leading-relaxed">
                  Accepted for direct customer purchases and physical trade-in pickups at the shop.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Website Content & Banners */}
      {activeTab === "content" && (
        <div className="space-y-6">
          <div className="admin-card space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <Globe size={18} className="text-[#d4af37]" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Public Storefront Presentation</h3>
                <p className="text-xs text-slate-500">
                  Key customer-facing copy and highlights appearing on buyandsellgh.com.
                </p>
              </div>
            </div>

            {/* Status explanation */}
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
              <Info size={15} className="shrink-0 text-amber-600" />
              <span>
                <strong>Operational Status:</strong> Storefront banners, headlines, and contact lines below are <strong>code-governed</strong> via <code className="font-mono bg-white px-1 py-0.5 rounded border border-amber-200">src/config/business.ts</code>. Modifying them requires updating code and deploying. Direct database-driven text fields are not yet active for these elements.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-[#d4af37]" />
                    Hero Headline
                  </span>
                  <span className="text-[0.65rem] px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-bold">
                    Code-Governed
                  </span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-slate-800 font-medium">
                  "Premium Apple Devices, Authentic Tech &amp; Guaranteed Service"
                </div>
                <p className="text-[0.7rem] text-slate-500">
                  Controls the primary landing banner headline rendered on the customer homepage. Edit in <code className="font-mono">src/config/business.ts</code>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Bell size={14} className="text-amber-500" />
                    Delivery Announcement
                  </span>
                  <span className="text-[0.65rem] px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-bold">
                    Code-Governed
                  </span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-slate-800 font-medium">
                  "Same-Day Delivery in Greater Accra &bull; Official Apple Warranty &bull; Nationwide Bus Parcels"
                </div>
                <p className="text-[0.7rem] text-slate-500">
                  Displayed on the header notification bar across all public storefront pages. Edit in <code className="font-mono">src/components/Header.tsx</code>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <MessageCircle size={14} className="text-emerald-600" />
                    WhatsApp Order Routing
                  </span>
                  <span className="text-[0.65rem] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                    +{business.whatsapp.primary}
                  </span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-slate-800 font-medium">
                  Direct deep-link for instant customer order review, trade-in valuations, and payment details.
                </div>
                <p className="text-[0.7rem] text-slate-500">
                  All website form completions automatically pre-populate this number from <code className="font-mono">src/config/business.ts</code>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-[#d4af37]" />
                    Product Visual Presentation
                  </span>
                  <span className="text-[0.65rem] px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-bold">
                    #FFFFFF Pure White
                  </span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-slate-800 font-medium">
                  Authoritative pure white backdrop (#FFFFFF) enforced across all device image assets.
                </div>
                <p className="text-[0.7rem] text-slate-500">
                  Clean Apple-standard product gallery rendering with no warm or gold background tints.
                </p>
              </div>
            </div>
          </div>

          {/* Configuration Architecture Guide */}
          <div className="admin-card space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Code2 size={16} className="text-slate-600" />
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Configuration Architecture &amp; Updating Guide
              </h4>
            </div>
            <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
              <p>
                <strong>Authoritative Source:</strong> Business numbers, operating hours, delivery notes, and social handles are governed by{" "}
                <code className="text-[#d4af37] bg-slate-50 px-1 py-0.5 rounded font-mono">
                  src/config/business.ts
                </code>
                .
              </p>
              <p>
                <strong>Catalog &amp; Pricing:</strong> Product details, descriptions, Ghana cedi prices, sale discounts, and inventory counts are governed by Supabase database tables (
                <code className="text-slate-800 bg-slate-50 px-1 py-0.5 rounded font-mono">products</code> and{" "}
                <code className="text-slate-800 bg-slate-50 px-1 py-0.5 rounded font-mono">product_variants</code>
                ) and can be modified directly on the <strong>Products</strong> and <strong>Pricing</strong> pages without any code deployments.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Store Policies & Terms */}
      {activeTab === "policies" && (
        <div className="admin-card space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <FileText size={18} className="text-[#d4af37]" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Customer Policies &amp; Terms of Service</h3>
              <p className="text-xs text-slate-500">
                Official terms published to customers on buyandsellgh.com.
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-700">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <strong className="text-slate-900 block font-bold">1. Device Authenticity &amp; Verification</strong>
              <p className="text-slate-600 leading-relaxed">
                All devices sold by Buy &amp; Sell GH are guaranteed genuine Apple and manufacturer original products. Serial numbers can be verified directly on Apple Check Coverage (checkcoverage.apple.com) upon receipt.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <strong className="text-slate-900 block font-bold">2. Official Warranty Coverage</strong>
              <p className="text-slate-600 leading-relaxed">
                Brand New devices carry the full 1-Year Official Apple International Warranty. Pre-Owned / Tested devices include our standard 6-Month Buy &amp; Sell GH shop replacement and repair warranty covering hardware defects.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <strong className="text-slate-900 block font-bold">3. Physical Inspection &amp; Doorstep Acceptance</strong>
              <p className="text-slate-600 leading-relaxed">
                Customers are invited to test battery health, screen condition, cameras, Face ID, and device responsiveness prior to completing payment on delivery in Accra.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <strong className="text-slate-900 block font-bold">4. Trade-In Valuation &amp; Condition Tiers</strong>
              <p className="text-slate-600 leading-relaxed">
                Preliminary trade-in quotes provided via WhatsApp are subject to physical inspection in-store or by our courier. Valuations consider battery health, cosmetics, original accessories, and iCloud sign-out status.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Hosting & Infrastructure */}
      {activeTab === "infrastructure" && (
        <div className="admin-card space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Server size={18} className="text-[#d4af37]" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Hosting &amp; Security Architecture</h3>
              <p className="text-xs text-slate-500">
                Verified production hosting topology and security configurations.
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Edge Hosting Network</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 size={13} /> Vercel Edge CDN (Production Branch: main)
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Database Layer</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 size={13} /> Supabase PostgreSQL (RLS Enforced)
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Administrative Isolation</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 size={13} /> admin.buyandsellgh.com (Dedicated Hostname)
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Public /admin Route</span>
              <span className="font-bold text-slate-900 flex items-center gap-1">
                <CheckCircle2 size={13} className="text-emerald-700" /> HTTP 404 Masking Active on buyandsellgh.com
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500 font-medium">Two-Factor Authentication</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 size={13} /> Supabase AAL2 TOTP Enforced
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
