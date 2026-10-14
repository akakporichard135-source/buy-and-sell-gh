import React, { createContext, useContext, useEffect, useState, useTransition } from "react";
import { CATEGORY_DEPARTMENTS } from "../components/store/category/categoryData";
import {
  defaultFaqs,
  defaultHomepageContent,
  defaultMediaItems,
  defaultPageContent,
  defaultSiteSettings,
} from "./defaultCmsData";
import {
  deleteMediaItemById,
  fetchFaqs,
  fetchHomepageContent,
  fetchMediaLibrary,
  fetchPageContent,
  fetchSiteSettings,
  fetchStorefrontContent,
  saveFaqs,
  saveHomepageContent,
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
  MediaItem,
  PageContentRegistry,
  SiteSettings,
} from "./types";

interface CmsContextValue {
  settings: SiteSettings;
  homepage: HomepageContent;
  media: MediaItem[];
  faqs: FaqItem[];
  pages: PageContentRegistry;
  departments: Record<string, CategoryDepartmentConfig>;
  loading: boolean;
  refreshCms: () => Promise<void>;
  updateSettings: (partial: Partial<SiteSettings>) => Promise<SiteSettings>;
  updateHomepage: (content: HomepageContent) => Promise<HomepageContent>;
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
  const [homepage, setHomepage] = useState<HomepageContent>(defaultHomepageContent);
  const [media, setMedia] = useState<MediaItem[]>(defaultMediaItems);
  const [faqs, setFaqs] = useState<FaqItem[]>(defaultFaqs);
  const [pages, setPages] = useState<PageContentRegistry>(defaultPageContent);
  const [departments, setDepartments] = useState<Record<string, CategoryDepartmentConfig>>(CATEGORY_DEPARTMENTS);
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  const loadAll = async () => {
    try {
      const [s, h, m, f, p, d] = await Promise.all([
        fetchSiteSettings(),
        fetchHomepageContent(),
        fetchMediaLibrary(),
        fetchFaqs(),
        fetchPageContent(),
        fetchStorefrontContent(),
      ]);

      startTransition(() => {
        setSettings(s);
        setHomepage(h);
        setMedia(m);
        setFaqs(f);
        setPages(p);
        setDepartments(d);
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
    return updated;
  };

  const handleDeleteMedia = async (id: string) => {
    await deleteMediaItemById(id);
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

  return (
    <CmsContext.Provider
      value={{
        settings,
        homepage,
        media,
        faqs,
        pages,
        departments,
        loading,
        refreshCms: loadAll,
        updateSettings: handleUpdateSettings,
        updateHomepage: handleUpdateHomepage,
        uploadMedia: handleUploadMedia,
        updateMedia: handleUpdateMedia,
        deleteMedia: handleDeleteMedia,
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
