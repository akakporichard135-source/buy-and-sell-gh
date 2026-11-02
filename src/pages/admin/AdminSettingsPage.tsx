import {
  AlertCircle,
  Bell,
  BellRing,
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
  Laptop,
  MapPin,
  MessageCircle,
  Phone,
  Play,
  RotateCcw,
  Server,
  Shield,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Square,
  Truck,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  getAudioContext,
  isAlertActive,
  isAudioUnlocked,
  playTone,
  SOUND_OPTIONS,
  stopAlertSound,
  unlockAudio,
  type AlertSoundType,
} from "../../admin/adminNotificationAudio";
import {
  getNotificationSettings,
  saveNotificationSettings,
  type AdminNotificationSettings,
} from "../../admin/adminNotificationState";
import { business } from "../../config/business";

export function AdminSettingsPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const requestedTab = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<
    "profile" | "content" | "policies" | "notifications" | "infrastructure"
  >(() => (requestedTab === "notifications" ? "notifications" : "profile"));

  // Notification configuration state
  const [notifSettings, setNotifSettings] = useState<AdminNotificationSettings>(getNotificationSettings);
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      return Notification.permission;
    }
    return "default";
  });
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [repeatingSoundActive, setRepeatingSoundActive] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [testingSound, setTestingSound] = useState(false);

  useEffect(() => {
    setAudioUnlocked(isAudioUnlocked());
    const interval = window.setInterval(() => {
      setRepeatingSoundActive(isAlertActive());
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const handleTestSound = async () => {
    setTestingSound(true);
    try {
      const ctx = await getAudioContext();
      if (ctx) {
        if (ctx.state === "suspended") await ctx.resume();
        setAudioUnlocked(ctx.state === "running");
        playTone(ctx, notifSettings.soundType, notifSettings.volume / 100);
      }
    } finally {
      window.setTimeout(() => setTestingSound(false), 800);
    }
  };

  const handleAuthorizeAudio = async () => {
    const success = await unlockAudio();
    if (success) {
      setAudioUnlocked(true);
      playTone((await getAudioContext())!, notifSettings.soundType, notifSettings.volume / 100);
    }
  };

  const handleRequestBrowserPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      try {
        const perm = await Notification.requestPermission();
        setBrowserPermission(perm);
        if (perm === "granted") {
          const next = { ...notifSettings, browserNotifications: true };
          setNotifSettings(next);
          saveNotificationSettings(next);
        }
      } catch {
        // Non-blocking
      }
    }
  };

  const handleSaveNotifications = () => {
    saveNotificationSettings(notifSettings);
    setSavedFeedback(true);
    window.setTimeout(() => setSavedFeedback(false), 3000);
  };

  const handleStopActiveAlert = () => {
    stopAlertSound();
    setRepeatingSoundActive(false);
  };

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
            Configure audio alerts, review store identity, manage website copy, inspect policies,
            and audit hosting infrastructure.
          </p>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-slate-100/80 border border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("notifications")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === "notifications"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Bell size={15} />
          <span>Notification Alerts &amp; Sound</span>
          {repeatingSoundActive && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          )}
        </button>

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

      {/* TAB: Notification Alerts & Sound */}
      {activeTab === "notifications" && (
        <div className="space-y-6">
          {savedFeedback && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold animate-in fade-in">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>Notification and audio preferences saved successfully!</span>
            </div>
          )}

          {/* Repeating Alarm Banner */}
          {repeatingSoundActive && (
            <div className="flex items-center justify-between p-4 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-md border-2 border-amber-300">
              <div className="flex items-center gap-2.5">
                <BellRing size={20} className="animate-spin" />
                <span>An unacknowledged order or service request alert is currently sounding!</span>
              </div>
              <button
                type="button"
                onClick={handleStopActiveAlert}
                className="px-4 py-2 rounded-lg bg-slate-950 text-white font-black uppercase tracking-wider hover:bg-slate-900 transition"
              >
                Silence Alarm
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Audio Settings Card */}
            <div className="admin-card space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <Volume2 size={18} className="text-[#d4af37]" />
                  <h3 className="font-bold text-slate-900 text-sm">Audible Alert Chime</h3>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifSettings.soundEnabled}
                    onChange={(e) => setNotifSettings({ ...notifSettings, soundEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Alert Sound Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Select Alert Sound
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={notifSettings.soundType}
                    disabled={!notifSettings.soundEnabled}
                    onChange={(e) =>
                      setNotifSettings({
                        ...notifSettings,
                        soundType: e.target.value as AlertSoundType,
                      })
                    }
                    className="flex-1 rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#d4af37] disabled:opacity-50"
                  >
                    {SOUND_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    disabled={!notifSettings.soundEnabled || testingSound}
                    onClick={() => void handleTestSound()}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition disabled:opacity-40"
                    title="Play chosen sound preview"
                  >
                    <Play size={13} className={testingSound ? "animate-pulse" : ""} />
                    <span>Test</span>
                  </button>
                </div>
                <p className="text-[0.72rem] text-slate-500">
                  {SOUND_OPTIONS.find((o) => o.id === notifSettings.soundType)?.description}
                </p>
              </div>

              {/* Volume Slider */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Alert Volume: <span className="font-mono text-[#b17d12]">{notifSettings.volume}%</span>
                  </label>
                  <div className="flex items-center gap-1">
                    {[25, 50, 75, 100].map((v) => (
                      <button
                        type="button"
                        key={v}
                        disabled={!notifSettings.soundEnabled}
                        onClick={() => setNotifSettings({ ...notifSettings, volume: v })}
                        className={`px-2 py-0.5 rounded text-[0.65rem] font-bold border ${
                          notifSettings.volume === v
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {v}%
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={notifSettings.volume}
                  disabled={!notifSettings.soundEnabled}
                  onChange={(e) => setNotifSettings({ ...notifSettings, volume: Number(e.target.value) })}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#d4af37]"
                />
              </div>

              {/* Repeating Alerts Setting */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-900 block">
                      Repeat Alerts Until Acknowledged
                    </label>
                    <span className="text-[0.7rem] text-slate-500">
                      Continuously replays chime at intervals so you never miss an incoming order.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifSettings.repeatAlerts}
                      disabled={!notifSettings.soundEnabled}
                      onChange={(e) => setNotifSettings({ ...notifSettings, repeatAlerts: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                </div>

                {notifSettings.repeatAlerts && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-xs text-slate-600 font-medium">Replay frequency:</span>
                    {[15, 30, 60, 120].map((sec) => (
                      <button
                        type="button"
                        key={sec}
                        disabled={!notifSettings.soundEnabled}
                        onClick={() => setNotifSettings({ ...notifSettings, repeatIntervalSeconds: sec })}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                          notifSettings.repeatIntervalSeconds === sec
                            ? "bg-amber-500 text-slate-950 border-amber-500"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        Every {sec}s
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Autoplay / Browser Audio Permission */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        audioUnlocked ? "bg-emerald-500" : "bg-amber-500"
                      }`}
                    />
                    <span className="font-bold text-slate-800">
                      Browser Audio Permission: {audioUnlocked ? "Authorized & Active" : "Waiting for Click"}
                    </span>
                  </div>
                  {!audioUnlocked && (
                    <button
                      type="button"
                      onClick={() => void handleAuthorizeAudio()}
                      className="px-2.5 py-1 rounded bg-[#d4af37] text-slate-900 font-bold text-[0.68rem] hover:bg-[#e5be48]"
                    >
                      Authorize Audio
                    </button>
                  )}
                </div>
                <p className="text-slate-500 text-[0.7rem] leading-relaxed">
                  Web browsers (Chrome, Safari, Edge) block audio until the user clicks within the window. Clicking anywhere in the Admin dashboard automatically unlocks sound for your session.
                </p>
              </div>
            </div>

            {/* Desktop & Mobile Background Alerts */}
            <div className="space-y-6">
              <div className="admin-card space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                  <Laptop size={18} className="text-[#d4af37]" />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Background &amp; Mobile Alerts</h3>
                    <p className="text-xs text-slate-500">
                      Receive notifications when the dashboard is open in another tab.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <strong className="block text-slate-900">Desktop / Mobile Push Banner</strong>
                      <span className="text-slate-500 text-[0.7rem]">
                        Status: <span className="font-bold uppercase text-slate-700">{browserPermission}</span>
                      </span>
                    </div>

                    {browserPermission !== "granted" ? (
                      <button
                        type="button"
                        onClick={() => void handleRequestBrowserPermission()}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
                      >
                        Enable Permission
                      </button>
                    ) : (
                      <span className="flex items-center gap-1 text-emerald-700 font-bold">
                        <CheckCircle2 size={16} />
                        Active
                      </span>
                    )}
                  </div>

                  <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 space-y-1.5">
                    <div className="font-bold flex items-center gap-1.5">
                      <Smartphone size={14} />
                      <span>Background Tab Execution</span>
                    </div>
                    <p className="text-[0.72rem] leading-relaxed">
                      When the Admin Dashboard is open in another browser tab or minimized on your computer or phone, incoming orders and service requests will trigger both the audible chime and the system banner alert.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 space-y-1">
                    <span className="font-bold text-slate-800 block text-[0.72rem]">Hardware &amp; System Audio Notice</span>
                    <p className="text-[0.7rem] leading-relaxed text-slate-500">
                      Web applications play sound via your device's audio subsystem. Website audio respects physical volume buttons, mute switches, Do Not Disturb, and operating system master volume.
                    </p>
                  </div>
                </div>
              </div>

              {/* Save Settings Action Bar */}
              <div className="flex items-center justify-end gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <button
                  type="button"
                  onClick={handleTestSound}
                  className="admin-btn admin-btn-secondary text-xs"
                >
                  <Play size={14} />
                  <span>Test Alert Sound</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveNotifications}
                  className="admin-btn admin-btn-primary text-xs"
                >
                  <CheckCircle2 size={14} />
                  <span>Save Notification Preferences</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
                <span>
                  <strong>Full Admin CMS Active:</strong> Storefront heroes, announcements, promotional tiles, service flyers, media assets, FAQs, and contact lines are now fully editable through the admin dashboard without code changes or developer intervention.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Store Policies & Terms */}
      {activeTab === "policies" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="admin-card space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <ShieldCheck size={18} className="text-[#d4af37]" />
              <h3 className="font-bold text-slate-900 text-sm">Warranty Policy</h3>
            </div>
            <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
              <p>
                <strong>Brand New Apple Devices:</strong> Covered by 1-Year Official Apple Limited Warranty, verifiable via checkcoverage.apple.com.
              </p>
              <p>
                <strong>Pre-Owned Devices:</strong> Backed by Buy &amp; Sell GH 30-Day In-House Store Guarantee covering hardware defects not caused by liquid damage or drops.
              </p>
            </div>
          </div>

          <div className="admin-card space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <Truck size={18} className="text-[#d4af37]" />
              <h3 className="font-bold text-slate-900 text-sm">Delivery &amp; Inspection Terms</h3>
            </div>
            <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
              <p>
                <strong>Immediate Verification:</strong> Customers are encouraged to thoroughly inspect physical condition and accessories upon delivery before completing payment.
              </p>
              <p>
                <strong>Dispatch Timeline:</strong> Greater Accra courier deliveries arrive within 1&ndash;4 hours depending on location.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Hosting & Security */}
      {activeTab === "infrastructure" && (
        <div className="admin-card space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Server size={18} className="text-[#d4af37]" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">System Infrastructure &amp; Security</h3>
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
