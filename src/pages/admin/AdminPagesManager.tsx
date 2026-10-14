import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Building2,
  CheckCircle2,
  Clock,
  FileText,
  HelpCircle,
  Info,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  Save,
  Shield,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useCms } from "../../cms/CmsContext";
import type { AboutPageContent, FaqItem, SiteSettings } from "../../cms/types";

export function AdminPagesManager() {
  const { settings, updateSettings, pages, updatePage, faqs, updateFaqs } = useCms();
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(settings);
  const [about, setAbout] = useState<AboutPageContent>(pages.about);
  const [faqList, setFaqList] = useState<FaqItem[]>(faqs);

  const [activeTab, setActiveTab] = useState<"contact" | "about" | "faqs" | "policies">("contact");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    setSaveSuccess(false);
    try {
      if (activeTab === "contact" || activeTab === "policies") {
        await updateSettings(siteSettings);
      } else if (activeTab === "about") {
        await updatePage("about", about);
      } else if (activeTab === "faqs") {
        await updateFaqs(faqList);
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save page content.");
    } finally {
      setSaving(false);
    }
  };

  const moveFaq = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= faqList.length) return;
    const copy = [...faqList];
    [copy[index], copy[nextIndex]] = [copy[nextIndex], copy[index]];
    setFaqList(copy.map((f, i) => ({ ...f, order: i + 1 })));
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Card */}
      <div className="admin-header-card">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#d4af37]">
              Website CMS
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300" />
            <span className="text-xs font-semibold text-slate-500">Editorial &amp; Information Pages</span>
          </div>
          <h2>Pages, Contact &amp; Policy Manager</h2>
          <p>
            Update About Us story copy, store phone numbers, WhatsApp contact lines, physical location,
            FAQ questions &amp; answers, operating hours, and customer delivery policies.
          </p>
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="admin-btn admin-btn-primary"
        >
          <Save size={16} />
          <span>{saving ? "Saving Changes..." : "Publish Page Updates"}</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>Page information successfully saved and published!</span>
        </div>
      )}

      {saveError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{saveError}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-slate-100/80 border border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("contact")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === "contact"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Building2 size={15} />
          <span>Store &amp; Contact Details</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("about")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === "about"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Users size={15} />
          <span>About Us Page</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("faqs")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === "faqs"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <HelpCircle size={15} />
          <span>Frequently Asked Questions ({faqList.length})</span>
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
          <span>Policies &amp; Notices</span>
        </button>
      </div>

      {/* TAB 1: STORE & CONTACT */}
      {activeTab === "contact" && (
        <div className="admin-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Store Identity &amp; Contact Channels</h3>
            <span className="text-xs text-slate-400">Controls Footer, Contact Page &amp; WhatsApp Links</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Business Name</label>
              <input
                type="text"
                value={siteSettings.name}
                onChange={(e) => setSiteSettings({ ...siteSettings, name: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Brand Tagline</label>
              <input
                type="text"
                value={siteSettings.tagline}
                onChange={(e) => setSiteSettings({ ...siteSettings, tagline: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Store Physical Location</label>
              <input
                type="text"
                value={siteSettings.location}
                onChange={(e) => setSiteSettings({ ...siteSettings, location: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Detailed Street Address</label>
              <input
                type="text"
                value={siteSettings.address}
                onChange={(e) => setSiteSettings({ ...siteSettings, address: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Primary Phone Number</label>
              <input
                type="text"
                value={siteSettings.phones[0] || ""}
                onChange={(e) => {
                  const phones = [...siteSettings.phones];
                  phones[0] = e.target.value;
                  setSiteSettings({ ...siteSettings, phones });
                }}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Secondary Phone Number</label>
              <input
                type="text"
                value={siteSettings.phones[1] || ""}
                onChange={(e) => {
                  const phones = [...siteSettings.phones];
                  phones[1] = e.target.value;
                  setSiteSettings({ ...siteSettings, phones });
                }}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Primary WhatsApp Line (International format)</label>
              <input
                type="text"
                value={siteSettings.whatsapp.primary}
                onChange={(e) =>
                  setSiteSettings({
                    ...siteSettings,
                    whatsapp: { ...siteSettings.whatsapp, primary: e.target.value },
                  })
                }
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white font-mono text-emerald-700"
                placeholder="233244182149"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Secondary WhatsApp Line</label>
              <input
                type="text"
                value={siteSettings.whatsapp.secondary}
                onChange={(e) =>
                  setSiteSettings({
                    ...siteSettings,
                    whatsapp: { ...siteSettings.whatsapp, secondary: e.target.value },
                  })
                }
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white font-mono text-emerald-700"
                placeholder="233551975451"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Instagram URL</label>
              <input
                type="text"
                value={siteSettings.social.instagram}
                onChange={(e) =>
                  setSiteSettings({
                    ...siteSettings,
                    social: { ...siteSettings.social, instagram: e.target.value },
                  })
                }
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white font-mono text-[0.7rem]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">TikTok URL</label>
              <input
                type="text"
                value={siteSettings.social.tiktok}
                onChange={(e) =>
                  setSiteSettings({
                    ...siteSettings,
                    social: { ...siteSettings.social, tiktok: e.target.value },
                  })
                }
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white font-mono text-[0.7rem]"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ABOUT US */}
      {activeTab === "about" && (
        <div className="space-y-6">
          <div className="admin-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">About Us Hero &amp; Story</h3>
              <span className="text-xs text-slate-400 font-mono">Storefront: /about</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Eyebrow Handle</label>
                <input
                  type="text"
                  value={about.eyebrow}
                  onChange={(e) => setAbout({ ...about, eyebrow: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Main Headline *</label>
                <input
                  type="text"
                  value={about.title}
                  onChange={(e) => setAbout({ ...about, title: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Subtitle / Mission Statement</label>
                <textarea
                  rows={2}
                  value={about.subtitle}
                  onChange={(e) => setAbout({ ...about, subtitle: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>
            </div>
          </div>

          <div className="admin-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Trust Pillars &amp; Service Highlights</h3>
              <button
                type="button"
                onClick={() =>
                  setAbout({
                    ...about,
                    pillars: [...about.pillars, { title: "New Trust Pillar", description: "Clear customer benefit." }],
                  })
                }
                className="admin-btn admin-btn-sm admin-btn-secondary"
              >
                <Plus size={13} />
                <span>Add Pillar</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {about.pillars.map((pillar, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">Pillar #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setAbout({ ...about, pillars: about.pillars.filter((_, i) => i !== idx) })
                      }
                      className="text-rose-500 hover:text-rose-700"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={pillar.title}
                    onChange={(e) => {
                      const updated = [...about.pillars];
                      updated[idx] = { ...updated[idx], title: e.target.value };
                      setAbout({ ...about, pillars: updated });
                    }}
                    className="w-full p-2 rounded border border-slate-200 bg-white font-bold"
                  />
                  <input
                    type="text"
                    value={pillar.description || ""}
                    onChange={(e) => {
                      const updated = [...about.pillars];
                      updated[idx] = { ...updated[idx], description: e.target.value };
                      setAbout({ ...about, pillars: updated });
                    }}
                    placeholder="Short description"
                    className="w-full p-2 rounded border border-slate-200 bg-white"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FAQS */}
      {activeTab === "faqs" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Store FAQs &amp; Help Answers</h3>
              <p className="text-xs text-slate-500">Appears on /faq and throughout customer checkout guidance.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                const newFaq: FaqItem = {
                  id: `faq-${Date.now()}`,
                  q: "New Frequently Asked Question?",
                  a: "Provide clear, trustworthy guidance here.",
                  order: faqList.length + 1,
                  enabled: true,
                };
                setFaqList([...faqList, newFaq]);
              }}
              className="admin-btn admin-btn-sm admin-btn-secondary"
            >
              <Plus size={14} />
              <span>Add FAQ</span>
            </button>
          </div>

          <div className="space-y-3">
            {faqList.map((faq, index) => (
              <div
                key={faq.id}
                className={`admin-card p-4 space-y-3 border transition ${
                  faq.enabled ? "border-slate-200" : "border-slate-200/50 bg-slate-50/50 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold text-[0.65rem] flex items-center justify-center">
                      {index + 1}
                    </span>
                    <h4 className="font-bold text-slate-900 text-xs truncate max-w-md">{faq.q}</h4>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <label className="flex items-center gap-1 text-[0.7rem] font-bold text-slate-700 cursor-pointer mr-1">
                      <input
                        type="checkbox"
                        checked={faq.enabled}
                        onChange={(e) => {
                          const copy = [...faqList];
                          copy[index] = { ...copy[index], enabled: e.target.checked };
                          setFaqList(copy);
                        }}
                        className="rounded border-slate-300 text-[#d4af37]"
                      />
                      <span>Active</span>
                    </label>

                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveFaq(index, -1)}
                      className="p-1 rounded border border-slate-200 hover:bg-slate-100 text-slate-600 disabled:opacity-30"
                    >
                      <ArrowUp size={12} />
                    </button>
                    <button
                      type="button"
                      disabled={index === faqList.length - 1}
                      onClick={() => moveFaq(index, 1)}
                      className="p-1 rounded border border-slate-200 hover:bg-slate-100 text-slate-600 disabled:opacity-30"
                    >
                      <ArrowDown size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setFaqList(faqList.filter((_, i) => i !== index))}
                      className="p-1 rounded border border-rose-200 text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-0.5">Question *</label>
                    <input
                      type="text"
                      value={faq.q}
                      onChange={(e) => {
                        const copy = [...faqList];
                        copy[index] = { ...copy[index], q: e.target.value };
                        setFaqList(copy);
                      }}
                      className="w-full p-2 rounded-lg border border-slate-200 bg-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-0.5">Answer *</label>
                    <textarea
                      rows={2}
                      value={faq.a}
                      onChange={(e) => {
                        const copy = [...faqList];
                        copy[index] = { ...copy[index], a: e.target.value };
                        setFaqList(copy);
                      }}
                      className="w-full p-2 rounded-lg border border-slate-200 bg-white leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: POLICIES */}
      {activeTab === "policies" && (
        <div className="admin-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Customer Policies &amp; Store Guarantees</h3>
            <span className="text-xs text-slate-400">Displayable on Shopping Information &amp; Checkout</span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Delivery &amp; Shipping Policy Notice</label>
              <textarea
                rows={3}
                value={siteSettings.deliveryNotice}
                onChange={(e) => setSiteSettings({ ...siteSettings, deliveryNotice: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white leading-relaxed"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Payment Guidance &amp; MoMo Verification</label>
              <textarea
                rows={3}
                value={siteSettings.paymentGuidance}
                onChange={(e) => setSiteSettings({ ...siteSettings, paymentGuidance: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white leading-relaxed"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Shop Warranty &amp; Guarantee Terms</label>
              <textarea
                rows={3}
                value={siteSettings.warrantyNotice}
                onChange={(e) => setSiteSettings({ ...siteSettings, warrantyNotice: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white leading-relaxed"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
