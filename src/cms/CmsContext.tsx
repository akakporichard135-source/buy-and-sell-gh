import React, { createContext, useContext, useEffect, useState, useTransition } from "react";
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
  fetchFaqs,
  fetchHomepageContent,
  fetchMainStoreContent,
  fetchMediaLibrary,
  fetchPageContent,
  fetchSiteSettings,
  fetchStorefrontContent,
  getInitialHomepageContent,
  removeMediaItemFromLibrary,
  saveFaqs,
  saveHomepageContent,
  saveMainStoreContent,
  savePageContent,
  saveSiteSettings,
  saveStorefrontContent,
  subscribeToCms,
  updateMediaAsset,
  uploadMediaAsset,
} from "./supabaseCmsRepository";
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
  mainStore: MainStoreConfig;
  media: MediaItem[];
  faqs: FaqItem[];
  pages: PageContentRegistry;
  departments: Record<string, CategoryDepartmentConfig>;
  loading: boolean;
  refreshCms: () => Promise<void>;
  updateSettings: (partial: Partial<SiteSettings>) => Promise<SiteSettings>;
  updateHomepage: (content: HomepageContent) => Promise<HomepageContent>;
  updateMainStore: (config: MainStoreConfig) => Promise<MainStoreConfig>;
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

export function CmsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [homepage, setHomepage] = useState<HomepageContent>(() => getInitialHomepageContent());
  const [mainStore, setMainStore] = useState<MainStoreConfig>(defaultMainStoreConfig);
  const [media, setMedia] = useState<MediaItem[]>(defaultMediaItems);
  const [faqs, setFaqs] = useState<FaqItem[]>(defaultFaqs);
  const [pages, setPages] = useState<PageContentRegistry>(defaultPageContent);
  const [departments, setDepartments] = useState<Record<string, CategoryDepartmentConfig>>(CATEGORY_DEPARTMENTS);
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  const loadAll = async () => {
    try {
      const [s, h, m, f, p, d, ms] = await Promise.all([
        fetchSiteSettings(),
        fetchHomepageContent(),
        fetchMediaLibrary(),
        fetchFaqs(),
        fetchPageContent(),
        fetchStorefrontContent(),
        fetchMainStoreContent(),
      ]);

      startTransition(() => {
        setSettings(s);
        setHomepage(h);
        setMedia(m);
        setFaqs(f);
        setPages(p);
        setDepartments(d);
        setMainStore(ms);
      });
    } catch {
      // Graceful fallback to initial values
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    const unsubscribe = subscribeToCms(() => {
      loadAll();
    });
    return () => {
      unsubscribe();
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
    return updated;
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
    return updated;
  };

  return (
    <CmsContext.Provider
      value={{
        settings,
        homepage,
        mainStore,
        media,
        faqs,
        pages,
        departments,
        loading,
        refreshCms: loadAll,
        updateSettings: handleUpdateSettings,
        updateHomepage: handleUpdateHomepage,
        updateMainStore: handleUpdateMainStore,
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
