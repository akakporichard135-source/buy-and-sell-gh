import React, { createContext, useContext, useEffect, useState, useTransition } from "react";
import { isAdminHostname } from "../config/adminHost";
import { CATEGORY_DEPARTMENTS } from "../components/store/category/categoryData";
import {
  defaultFaqs,
  defaultMainStoreConfig,
  defaultMediaItems,
  defaultPageContent,
  defaultSiteSettings,
} from "./defaultCmsData";
import {
  deleteMediaItemById,
  deleteMediaItemPermanently,
  discardHomepageDraft,
  discardHomepageLegacyDraft,
  discardIpadPageDraft,
  discardIphonePageDraft,
  discardWatchPageDraft,
  discardAirpodsPageDraft,
  discardAccessoriesPageDraft,
  discardMacPageDraft,
  discardMainStoreDraft,
  fetchFaqs,
  fetchHomepageContent,
  fetchHomepageDraft,
  fetchHomepageLegacyDraft,
  fetchIpadPageContent,
  fetchIpadPageDraft,
  fetchIphonePageContent,
  fetchIphonePageDraft,
  fetchWatchPageContent,
  fetchWatchPageDraft,
  fetchAirpodsPageContent,
  fetchAirpodsPageDraft,
  fetchAccessoriesPageContent,
  fetchAccessoriesPageDraft,
  fetchMacPageContent,
  fetchMacPageDraft,
  fetchMainStoreContent,
  fetchMainStoreDraft,
  fetchMediaLibrary,
  fetchPageContent,
  fetchSiteSettings,
  fetchStorefrontContent,
  getInitialFaqs,
  getInitialHomepageContent,
  getInitialHomepageDraft,
  getInitialHomepageLegacyDraft,
  getInitialIpadPageContent,
  getInitialIpadPageDraft,
  getInitialIphonePageContent,
  getInitialIphonePageDraft,
  getInitialWatchPageContent,
  getInitialWatchPageDraft,
  getInitialAirpodsPageContent,
  getInitialAirpodsPageDraft,
  getInitialAccessoriesPageContent,
  getInitialAccessoriesPageDraft,
  getInitialMacPageContent,
  getInitialMacPageDraft,
  getInitialMainStoreContent,
  getInitialMainStoreDraft,
  getInitialMediaLibrary,
  getInitialPageContent,
  getInitialSiteSettings,
  getInitialStorefrontContent,
  hasVerifiedLocalHomepageContent,
  removeMediaItemFromLibrary,
  saveFaqs,
  saveHomepageContent,
  saveHomepageDraft,
  saveHomepageLegacyDraft,
  saveIpadPageContent,
  saveIpadPageDraft,
  saveIphonePageContent,
  saveIphonePageDraft,
  saveWatchPageContent,
  saveWatchPageDraft,
  saveAirpodsPageContent,
  saveAirpodsPageDraft,
  saveAccessoriesPageContent,
  saveAccessoriesPageDraft,
  saveMacPageContent,
  saveMacPageDraft,
  saveMainStoreContent,
  saveMainStoreDraft,
  savePageContent,
  saveSiteSettings,
  saveStorefrontContent,
  subscribeToCms,
  updateMediaAsset,
  uploadMediaAsset,
} from "./supabaseCmsRepository";
import { subscribeToPublishedUpdates } from "../utils/imageVersioning";
import type {
  CategoryDepartmentConfig,
  FaqItem,
  HomepageContent,
  IpadPageConfig,
  IphonePageConfig,
  WatchPageConfig,
  AirpodsPageConfig,
  AccessoriesPageConfig,
  MacPageConfig,
  MainStoreConfig,
  MediaItem,
  PageContentRegistry,
  SiteSettings,
} from "./types";

interface CmsContextValue {
  settings: SiteSettings;
  homepage: HomepageContent;
  homepageDraft: HomepageContent | null;
  homepageLegacyDraft: HomepageContent | null;
  mainStore: MainStoreConfig;
  mainStoreDraft: MainStoreConfig | null;
  macPage: MacPageConfig;
  macPageDraft: MacPageConfig | null;
  ipadPage: IpadPageConfig;
  ipadPageDraft: IpadPageConfig | null;
  iphonePage: IphonePageConfig;
  iphonePageDraft: IphonePageConfig | null;
  watchPage: WatchPageConfig;
  watchPageDraft: WatchPageConfig | null;
  airpodsPage: AirpodsPageConfig;
  airpodsPageDraft: AirpodsPageConfig | null;
  accessoriesPage: AccessoriesPageConfig;
  accessoriesPageDraft: AccessoriesPageConfig | null;
  media: MediaItem[];
  faqs: FaqItem[];
  pages: PageContentRegistry;
  departments: Record<string, CategoryDepartmentConfig>;
  loading: boolean;
  hasVerifiedHomepage: boolean;
  refreshCms: () => Promise<void>;
  updateSettings: (partial: Partial<SiteSettings>) => Promise<SiteSettings>;
  updateHomepage: (content: HomepageContent) => Promise<HomepageContent>;
  saveHomepageDraftConfig: (content: HomepageContent) => Promise<HomepageContent>;
  discardHomepageDraftConfig: () => Promise<void>;
  saveHomepageLegacyDraftConfig: (content: HomepageContent) => Promise<HomepageContent>;
  discardHomepageLegacyDraftConfig: () => Promise<void>;
  updateMainStore: (config: MainStoreConfig) => Promise<MainStoreConfig>;
  saveMainStoreDraftConfig: (config: MainStoreConfig) => Promise<MainStoreConfig>;
  discardMainStoreDraftConfig: () => Promise<void>;
  updateMacPage: (config: MacPageConfig) => Promise<MacPageConfig>;
  saveMacPageDraftConfig: (config: MacPageConfig) => Promise<MacPageConfig>;
  discardMacPageDraftConfig: () => Promise<void>;
  updateIpadPage: (config: IpadPageConfig) => Promise<IpadPageConfig>;
  saveIpadPageDraftConfig: (config: IpadPageConfig) => Promise<IpadPageConfig>;
  discardIpadPageDraftConfig: () => Promise<void>;
  updateIphonePage: (config: IphonePageConfig) => Promise<IphonePageConfig>;
  saveIphonePageDraftConfig: (config: IphonePageConfig) => Promise<IphonePageConfig>;
  discardIphonePageDraftConfig: () => Promise<void>;
  updateWatchPage: (config: WatchPageConfig) => Promise<WatchPageConfig>;
  saveWatchPageDraftConfig: (config: WatchPageConfig) => Promise<WatchPageConfig>;
  discardWatchPageDraftConfig: () => Promise<void>;
  updateAirpodsPage: (config: AirpodsPageConfig) => Promise<AirpodsPageConfig>;
  saveAirpodsPageDraftConfig: (config: AirpodsPageConfig) => Promise<AirpodsPageConfig>;
  discardAirpodsPageDraftConfig: () => Promise<void>;
  updateAccessoriesPage: (config: AccessoriesPageConfig) => Promise<AccessoriesPageConfig>;
  saveAccessoriesPageDraftConfig: (config: AccessoriesPageConfig) => Promise<AccessoriesPageConfig>;
  discardAccessoriesPageDraftConfig: () => Promise<void>;
  uploadMedia: (
    file: File,
    category?: MediaItem["category"],
    customTitle?: string
  ) => Promise<MediaItem>;
  updateMedia: (
    id: string,
    updates: {
      title?: string;
      alt?: string;
      category?: MediaItem["category"];
      fit?: "cover" | "contain";
      position?: "center" | "top" | "bottom";
    },
    replacementFile?: File
  ) => Promise<MediaItem>;
  deleteMedia: (id: string) => Promise<void>;
  removeFromLibrary: (id: string) => Promise<void>;
  deletePermanently: (id: string) => Promise<void>;
  updateFaqs: (faqs: FaqItem[]) => Promise<FaqItem[]>;
  updatePage: <K extends keyof PageContentRegistry>(
    key: K,
    content: PageContentRegistry[K]
  ) => Promise<PageContentRegistry[K]>;
  updateStorefront: (
    departments: Record<string, CategoryDepartmentConfig>
  ) => Promise<Record<string, CategoryDepartmentConfig>>;
}

const CmsContext = createContext<CmsContextValue | null>(null);

const PUBLIC_CMS_TIMEOUT_MS = 3500;

function withTimeoutFallback<T>(
  promise: Promise<T>,
  timeoutMs: number,
  fallback: T,
  onLateResolve?: (value: T) => void
): Promise<T> {
  return new Promise<T>((resolve) => {
    let settled = false;
    const timer =
      typeof window !== "undefined"
        ? window.setTimeout(() => {
            if (!settled) {
              settled = true;
              resolve(fallback);
            }
          }, timeoutMs)
        : null;

    promise
      .then((value) => {
        if (!settled) {
          settled = true;
          if (timer !== null) window.clearTimeout(timer);
          resolve(value);
        } else if (onLateResolve) {
          onLateResolve(value);
        }
      })
      .catch(() => {
        if (!settled) {
          settled = true;
          if (timer !== null) window.clearTimeout(timer);
          resolve(fallback);
        }
      });
  });
}

function shouldLoadAdminCmsSlices(): boolean {
  if (isAdminHostname()) return true;
  if (typeof window === "undefined") return false;
  const pathname = window.location.pathname || "";
  const search = window.location.search || "";
  return pathname.startsWith("/admin") || search.includes("preview=") || search.includes("admin_preview=1");
}

export function CmsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(() => getInitialSiteSettings());
  const [homepage, setHomepage] = useState<HomepageContent>(() => getInitialHomepageContent());
  const [homepageDraft, setHomepageDraft] = useState<HomepageContent | null>(() => getInitialHomepageDraft());
  const [homepageLegacyDraft, setHomepageLegacyDraft] = useState<HomepageContent | null>(() => getInitialHomepageLegacyDraft());
  const [mainStore, setMainStore] = useState<MainStoreConfig>(() => getInitialMainStoreContent());
  const [mainStoreDraft, setMainStoreDraft] = useState<MainStoreConfig | null>(() => getInitialMainStoreDraft());
  const [macPage, setMacPage] = useState<MacPageConfig>(() => getInitialMacPageContent());
  const [macPageDraft, setMacPageDraft] = useState<MacPageConfig | null>(() => getInitialMacPageDraft());
  const [ipadPage, setIpadPage] = useState<IpadPageConfig>(() => getInitialIpadPageContent());
  const [ipadPageDraft, setIpadPageDraft] = useState<IpadPageConfig | null>(() => getInitialIpadPageDraft());
  const [iphonePage, setIphonePage] = useState<IphonePageConfig>(() => getInitialIphonePageContent());
  const [iphonePageDraft, setIphonePageDraft] = useState<IphonePageConfig | null>(() => getInitialIphonePageDraft());
  const [watchPage, setWatchPage] = useState<WatchPageConfig>(() => getInitialWatchPageContent());
  const [watchPageDraft, setWatchPageDraft] = useState<WatchPageConfig | null>(() => getInitialWatchPageDraft());
  const [airpodsPage, setAirpodsPage] = useState<AirpodsPageConfig>(() => getInitialAirpodsPageContent());
  const [airpodsPageDraft, setAirpodsPageDraft] = useState<AirpodsPageConfig | null>(() => getInitialAirpodsPageDraft());
  const [accessoriesPage, setAccessoriesPage] = useState<AccessoriesPageConfig>(() => getInitialAccessoriesPageContent());
  const [accessoriesPageDraft, setAccessoriesPageDraft] = useState<AccessoriesPageConfig | null>(() => getInitialAccessoriesPageDraft());
  const [media, setMedia] = useState<MediaItem[]>(() => getInitialMediaLibrary());
  const [faqs, setFaqs] = useState<FaqItem[]>(() => getInitialFaqs());
  const [pages, setPages] = useState<PageContentRegistry>(() => getInitialPageContent());
  const [departments, setDepartments] = useState<Record<string, CategoryDepartmentConfig>>(() => getInitialStorefrontContent());
  const [loading, setLoading] = useState(() => !hasVerifiedLocalHomepageContent());
  const [, startTransition] = useTransition();

  const loadAll = async () => {
    const includeAdminSlices = shouldLoadAdminCmsSlices();

    // 1. Resolve public homepage independently with a safe timeout so slow/offline Supabase
    //    or secondary/admin-only queries NEVER freeze the homepage on a blank skeleton.
    //    If Supabase finishes after the timeout, still hydrate the live CMS state seamlessly.
    const homepagePromise = withTimeoutFallback(
      fetchHomepageContent(),
      PUBLIC_CMS_TIMEOUT_MS,
      getInitialHomepageContent(),
      (liveHomepage) => {
        startTransition(() => {
          setHomepage(liveHomepage);
        });
      }
    )
      .then((h) => {
        startTransition(() => {
          setHomepage(h);
        });
      })
      .finally(() => {
        setLoading(false);
      });

    // 2. Load remaining public storefront CMS slices concurrently without blocking homepage paint.
    const publicSecondaryPromise = Promise.allSettled([
      withTimeoutFallback(fetchSiteSettings(), PUBLIC_CMS_TIMEOUT_MS, getInitialSiteSettings(), (v) =>
        startTransition(() => setSettings(v))
      ),
      withTimeoutFallback(fetchFaqs(), PUBLIC_CMS_TIMEOUT_MS, getInitialFaqs(), (v) =>
        startTransition(() => setFaqs(v))
      ),
      withTimeoutFallback(fetchPageContent(), PUBLIC_CMS_TIMEOUT_MS, getInitialPageContent(), (v) =>
        startTransition(() => setPages(v))
      ),
      withTimeoutFallback(fetchStorefrontContent(), PUBLIC_CMS_TIMEOUT_MS, getInitialStorefrontContent(), (v) =>
        startTransition(() => setDepartments(v))
      ),
      withTimeoutFallback(fetchMainStoreContent(), PUBLIC_CMS_TIMEOUT_MS, getInitialMainStoreContent(), (v) =>
        startTransition(() => setMainStore(v))
      ),
      withTimeoutFallback(fetchMacPageContent(), PUBLIC_CMS_TIMEOUT_MS, getInitialMacPageContent(), (v) =>
        startTransition(() => setMacPage(v))
      ),
      withTimeoutFallback(fetchIpadPageContent(), PUBLIC_CMS_TIMEOUT_MS, getInitialIpadPageContent(), (v) =>
        startTransition(() => setIpadPage(v))
      ),
      withTimeoutFallback(fetchIphonePageContent(), PUBLIC_CMS_TIMEOUT_MS, getInitialIphonePageContent(), (v) =>
        startTransition(() => setIphonePage(v))
      ),
      withTimeoutFallback(fetchWatchPageContent(), PUBLIC_CMS_TIMEOUT_MS, getInitialWatchPageContent(), (v) =>
        startTransition(() => setWatchPage(v))
      ),
      withTimeoutFallback(fetchAirpodsPageContent(), PUBLIC_CMS_TIMEOUT_MS, getInitialAirpodsPageContent(), (v) =>
        startTransition(() => setAirpodsPage(v))
      ),
      withTimeoutFallback(fetchAccessoriesPageContent(), PUBLIC_CMS_TIMEOUT_MS, getInitialAccessoriesPageContent(), (v) =>
        startTransition(() => setAccessoriesPage(v))
      ),
    ]).then(([sRes, fRes, pRes, dRes, msRes, macRes, ipadRes, iphoneRes, watchRes, airpodsRes, accRes]) => {
      startTransition(() => {
        if (sRes.status === "fulfilled") setSettings(sRes.value);
        if (fRes.status === "fulfilled") setFaqs(fRes.value);
        if (pRes.status === "fulfilled") setPages(pRes.value);
        if (dRes.status === "fulfilled") setDepartments(dRes.value);
        if (msRes.status === "fulfilled") setMainStore(msRes.value);
        if (macRes.status === "fulfilled") setMacPage(macRes.value);
        if (ipadRes.status === "fulfilled") setIpadPage(ipadRes.value);
        if (iphoneRes.status === "fulfilled") setIphonePage(iphoneRes.value);
        if (watchRes.status === "fulfilled") setWatchPage(watchRes.value);
        if (airpodsRes.status === "fulfilled") setAirpodsPage(airpodsRes.value);
        if (accRes.status === "fulfilled") setAccessoriesPage(accRes.value);
      });
    });

    // 3. Load admin-only drafts and Media Library strictly in Admin / preview sessions.
    const adminSlicesPromise = includeAdminSlices
      ? Promise.allSettled([
          fetchHomepageDraft(),
          fetchHomepageLegacyDraft(),
          fetchMediaLibrary(),
          fetchMainStoreDraft(),
          fetchMacPageDraft(),
          fetchIpadPageDraft(),
          fetchIphonePageDraft(),
          fetchWatchPageDraft(),
          fetchAirpodsPageDraft(),
          fetchAccessoriesPageDraft(),
        ]).then(([hDraftRes, hLegacyDraftRes, mRes, msDraftRes, macDraftRes, ipadDraftRes, iphoneDraftRes, watchDraftRes, airpodsDraftRes, accDraftRes]) => {
          startTransition(() => {
            if (hDraftRes.status === "fulfilled") setHomepageDraft(hDraftRes.value);
            if (hLegacyDraftRes.status === "fulfilled") setHomepageLegacyDraft(hLegacyDraftRes.value);
            if (mRes.status === "fulfilled") setMedia(mRes.value);
            if (msDraftRes.status === "fulfilled") setMainStoreDraft(msDraftRes.value);
            if (macDraftRes.status === "fulfilled") setMacPageDraft(macDraftRes.value);
            if (ipadDraftRes.status === "fulfilled") setIpadPageDraft(ipadDraftRes.value);
            if (iphoneDraftRes.status === "fulfilled") setIphonePageDraft(iphoneDraftRes.value);
            if (watchDraftRes.status === "fulfilled") setWatchPageDraft(watchDraftRes.value);
            if (airpodsDraftRes.status === "fulfilled") setAirpodsPageDraft(airpodsDraftRes.value);
            if (accDraftRes.status === "fulfilled") setAccessoriesPageDraft(accDraftRes.value);
          });
        })
      : Promise.resolve();

    await Promise.allSettled([homepagePromise, publicSecondaryPromise, adminSlicesPromise]);
  };

  useEffect(() => {
    loadAll();
    const unsubscribeCms = subscribeToCms(() => {
      loadAll();
    });
    const unsubscribePub = subscribeToPublishedUpdates(() => {
      loadAll();
    });
    return () => {
      unsubscribeCms();
      unsubscribePub();
    };
  }, []);

  const handleUpdateSettings = async (partial: Partial<SiteSettings>) => {
    const updated = await saveSiteSettings(partial);
    setSettings(updated);
    return updated;
  };

  const handleUpdateHomepage = async (content: HomepageContent) => {
    const updated = await saveHomepageContent(content);
    setHomepage(updated);
    if (updated.layoutMode === "modular") {
      setHomepageDraft(null);
    } else {
      setHomepageLegacyDraft(null);
    }
    return updated;
  };

  const handleSaveHomepageDraft = async (content: HomepageContent) => {
    const draft = await saveHomepageDraft(content);
    setHomepageDraft(draft);
    return draft;
  };

  const handleDiscardHomepageDraft = async () => {
    await discardHomepageDraft();
    setHomepageDraft(null);
  };

  const handleSaveHomepageLegacyDraft = async (content: HomepageContent) => {
    const draft = await saveHomepageLegacyDraft(content);
    setHomepageLegacyDraft(draft);
    return draft;
  };

  const handleDiscardHomepageLegacyDraft = async () => {
    await discardHomepageLegacyDraft();
    setHomepageLegacyDraft(null);
  };

  const handleUploadMedia = async (
    file: File,
    category?: MediaItem["category"],
    customTitle?: string
  ) => {
    const uploaded = await uploadMediaAsset(file, category, customTitle);
    setMedia((prev) => [uploaded, ...prev]);
    return uploaded;
  };

  const handleUpdateMedia = async (
    id: string,
    updates: {
      title?: string;
      alt?: string;
      category?: MediaItem["category"];
      fit?: "cover" | "contain";
      position?: "center" | "top" | "bottom";
    },
    replacementFile?: File
  ) => {
    const updated = await updateMediaAsset(id, updates, replacementFile);
    setMedia((prev) => prev.map((m) => (m.id === id ? updated : m)));
    const freshHomepage = await fetchHomepageContent();
    setHomepage(freshHomepage);
    const freshDepts = await fetchStorefrontContent();
    setDepartments(freshDepts);
    return updated;
  };

  const handleRemoveFromLibrary = async (id: string) => {
    await removeMediaItemFromLibrary(id);
    setMedia((prev) => prev.filter((m) => m.id !== id));
  };

  const handleDeletePermanently = async (id: string) => {
    await deleteMediaItemPermanently(id);
    setMedia((prev) => prev.filter((m) => m.id !== id));
  };

  const handleDeleteMedia = async (id: string) => {
    await deleteMediaItemPermanently(id);
    setMedia((prev) => prev.filter((m) => m.id !== id));
  };

  const handleUpdateFaqs = async (newFaqs: FaqItem[]) => {
    const updated = await saveFaqs(newFaqs);
    setFaqs(updated);
    return updated;
  };

  const handleUpdatePage = async <K extends keyof PageContentRegistry>(
    key: K,
    content: PageContentRegistry[K]
  ) => {
    const updated = await savePageContent(key, content);
    setPages((prev) => ({ ...prev, [key]: updated }));
    return updated;
  };

  const handleUpdateStorefront = async (
    newDepartments: Record<string, CategoryDepartmentConfig>
  ) => {
    const updated = await saveStorefrontContent(newDepartments);
    setDepartments(updated);
    return updated;
  };

  const handleUpdateMainStore = async (newConfig: MainStoreConfig) => {
    const updated = await saveMainStoreContent(newConfig);
    setMainStore(updated);
    setMainStoreDraft(null);
    return updated;
  };

  const handleSaveMainStoreDraft = async (newConfig: MainStoreConfig) => {
    const draft = await saveMainStoreDraft(newConfig);
    setMainStoreDraft(draft);
    return draft;
  };

  const handleDiscardMainStoreDraft = async () => {
    await discardMainStoreDraft();
    setMainStoreDraft(null);
  };

  const handleUpdateMacPage = async (newConfig: MacPageConfig) => {
    const updated = await saveMacPageContent(newConfig);
    setMacPage(updated);
    setMacPageDraft(null);
    return updated;
  };

  const handleSaveMacPageDraft = async (newConfig: MacPageConfig) => {
    const draft = await saveMacPageDraft(newConfig);
    setMacPageDraft(draft);
    return draft;
  };

  const handleDiscardMacPageDraft = async () => {
    await discardMacPageDraft();
    setMacPageDraft(null);
  };

  const handleUpdateIpadPage = async (newConfig: IpadPageConfig) => {
    const updated = await saveIpadPageContent(newConfig);
    setIpadPage(updated);
    setIpadPageDraft(null);
    return updated;
  };

  const handleSaveIpadPageDraft = async (newConfig: IpadPageConfig) => {
    const draft = await saveIpadPageDraft(newConfig);
    setIpadPageDraft(draft);
    return draft;
  };

  const handleDiscardIpadPageDraft = async () => {
    await discardIpadPageDraft();
    setIpadPageDraft(null);
  };

  const handleUpdateIphonePage = async (newConfig: IphonePageConfig) => {
    const updated = await saveIphonePageContent(newConfig);
    setIphonePage(updated);
    setIphonePageDraft(null);
    return updated;
  };

  const handleSaveIphonePageDraft = async (newConfig: IphonePageConfig) => {
    const draft = await saveIphonePageDraft(newConfig);
    setIphonePageDraft(draft);
    return draft;
  };

  const handleDiscardIphonePageDraft = async () => {
    await discardIphonePageDraft();
    setIphonePageDraft(null);
  };

  const handleUpdateWatchPage = async (newConfig: WatchPageConfig) => {
    const updated = await saveWatchPageContent(newConfig);
    setWatchPage(updated);
    setWatchPageDraft(null);
    return updated;
  };

  const handleSaveWatchPageDraft = async (newConfig: WatchPageConfig) => {
    const draft = await saveWatchPageDraft(newConfig);
    setWatchPageDraft(draft);
    return draft;
  };

  const handleDiscardWatchPageDraft = async () => {
    await discardWatchPageDraft();
    setWatchPageDraft(null);
  };

  const handleUpdateAirpodsPage = async (newConfig: AirpodsPageConfig) => {
    const updated = await saveAirpodsPageContent(newConfig);
    setAirpodsPage(updated);
    setAirpodsPageDraft(null);
    return updated;
  };

  const handleSaveAirpodsPageDraft = async (newConfig: AirpodsPageConfig) => {
    const draft = await saveAirpodsPageDraft(newConfig);
    setAirpodsPageDraft(draft);
    return draft;
  };

  const handleDiscardAirpodsPageDraft = async () => {
    await discardAirpodsPageDraft();
    setAirpodsPageDraft(null);
  };

  const handleUpdateAccessoriesPage = async (newConfig: AccessoriesPageConfig) => {
    const updated = await saveAccessoriesPageContent(newConfig);
    setAccessoriesPage(updated);
    setAccessoriesPageDraft(null);
    return updated;
  };

  const handleSaveAccessoriesPageDraft = async (newConfig: AccessoriesPageConfig) => {
    const draft = await saveAccessoriesPageDraft(newConfig);
    setAccessoriesPageDraft(draft);
    return draft;
  };

  const handleDiscardAccessoriesPageDraft = async () => {
    await discardAccessoriesPageDraft();
    setAccessoriesPageDraft(null);
  };

  return (
    <CmsContext.Provider
      value={{
        settings,
        homepage,
        homepageDraft,
        homepageLegacyDraft,
        mainStore,
        mainStoreDraft,
        macPage,
        macPageDraft,
        ipadPage,
        ipadPageDraft,
        iphonePage,
        iphonePageDraft,
        watchPage,
        watchPageDraft,
        airpodsPage,
        airpodsPageDraft,
        accessoriesPage,
        accessoriesPageDraft,
        media,
        faqs,
        pages,
        departments,
        loading,
        hasVerifiedHomepage: hasVerifiedLocalHomepageContent(),
        refreshCms: loadAll,
        updateSettings: handleUpdateSettings,
        updateHomepage: handleUpdateHomepage,
        saveHomepageDraftConfig: handleSaveHomepageDraft,
        discardHomepageDraftConfig: handleDiscardHomepageDraft,
        saveHomepageLegacyDraftConfig: handleSaveHomepageLegacyDraft,
        discardHomepageLegacyDraftConfig: handleDiscardHomepageLegacyDraft,
        updateMainStore: handleUpdateMainStore,
        saveMainStoreDraftConfig: handleSaveMainStoreDraft,
        discardMainStoreDraftConfig: handleDiscardMainStoreDraft,
        updateMacPage: handleUpdateMacPage,
        saveMacPageDraftConfig: handleSaveMacPageDraft,
        discardMacPageDraftConfig: handleDiscardMacPageDraft,
        updateIpadPage: handleUpdateIpadPage,
        saveIpadPageDraftConfig: handleSaveIpadPageDraft,
        discardIpadPageDraftConfig: handleDiscardIpadPageDraft,
        updateIphonePage: handleUpdateIphonePage,
        saveIphonePageDraftConfig: handleSaveIphonePageDraft,
        discardIphonePageDraftConfig: handleDiscardIphonePageDraft,
        updateWatchPage: handleUpdateWatchPage,
        saveWatchPageDraftConfig: handleSaveWatchPageDraft,
        discardWatchPageDraftConfig: handleDiscardWatchPageDraft,
        updateAirpodsPage: handleUpdateAirpodsPage,
        saveAirpodsPageDraftConfig: handleSaveAirpodsPageDraft,
        discardAirpodsPageDraftConfig: handleDiscardAirpodsPageDraft,
        updateAccessoriesPage: handleUpdateAccessoriesPage,
        saveAccessoriesPageDraftConfig: handleSaveAccessoriesPageDraft,
        discardAccessoriesPageDraftConfig: handleDiscardAccessoriesPageDraft,
        uploadMedia: handleUploadMedia,
        updateMedia: handleUpdateMedia,
        deleteMedia: handleDeleteMedia,
        removeFromLibrary: handleRemoveFromLibrary,
        deletePermanently: handleDeletePermanently,
        updateFaqs: handleUpdateFaqs,
        updatePage: handleUpdatePage,
        updateStorefront: handleUpdateStorefront,
      }}
    >
      {children}
    </CmsContext.Provider>
  );
}

export function useCms(): CmsContextValue {
  const ctx = useContext(CmsContext);
  if (!ctx) {
    throw new Error("useCms must be used within a CmsProvider");
  }
  return ctx;
}
