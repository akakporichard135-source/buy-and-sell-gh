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
  discardMainStoreDraft,
  fetchFaqs,
  fetchHomepageContent,
  fetchHomepageDraft,
  fetchHomepageLegacyDraft,
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

function withTimeoutFallback<T>(promise: Promise<T>, timeoutMs: number, fallback: T): Promise<T> {
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
    const homepagePromise = withTimeoutFallback(
      fetchHomepageContent(),
      PUBLIC_CMS_TIMEOUT_MS,
      getInitialHomepageContent()
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
      withTimeoutFallback(fetchSiteSettings(), PUBLIC_CMS_TIMEOUT_MS, getInitialSiteSettings()),
      withTimeoutFallback(fetchFaqs(), PUBLIC_CMS_TIMEOUT_MS, getInitialFaqs()),
      withTimeoutFallback(fetchPageContent(), PUBLIC_CMS_TIMEOUT_MS, getInitialPageContent()),
      withTimeoutFallback(fetchStorefrontContent(), PUBLIC_CMS_TIMEOUT_MS, getInitialStorefrontContent()),
      withTimeoutFallback(fetchMainStoreContent(), PUBLIC_CMS_TIMEOUT_MS, getInitialMainStoreContent()),
    ]).then(([sRes, fRes, pRes, dRes, msRes]) => {
      startTransition(() => {
        if (sRes.status === "fulfilled") setSettings(sRes.value);
        if (fRes.status === "fulfilled") setFaqs(fRes.value);
        if (pRes.status === "fulfilled") setPages(pRes.value);
        if (dRes.status === "fulfilled") setDepartments(dRes.value);
        if (msRes.status === "fulfilled") setMainStore(msRes.value);
      });
    });

    // 3. Load admin-only drafts and Media Library strictly in Admin / preview sessions.
    const adminSlicesPromise = includeAdminSlices
      ? Promise.allSettled([
          fetchHomepageDraft(),
          fetchHomepageLegacyDraft(),
          fetchMediaLibrary(),
          fetchMainStoreDraft(),
        ]).then(([hDraftRes, hLegacyDraftRes, mRes, msDraftRes]) => {
          startTransition(() => {
            if (hDraftRes.status === "fulfilled") setHomepageDraft(hDraftRes.value);
            if (hLegacyDraftRes.status === "fulfilled") setHomepageLegacyDraft(hLegacyDraftRes.value);
            if (mRes.status === "fulfilled") setMedia(mRes.value);
            if (msDraftRes.status === "fulfilled") setMainStoreDraft(msDraftRes.value);
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

  return (
    <CmsContext.Provider
      value={{
        settings,
        homepage,
        homepageDraft,
        homepageLegacyDraft,
        mainStore,
        mainStoreDraft,
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
