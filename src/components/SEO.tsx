import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
}

export function SEO({ title, description }: SEOProps) {
  useEffect(() => {
    const fullTitle = `${title} | Buy & Sell GH`;
    const canonicalUrl = `${window.location.origin}${window.location.pathname}`;
    document.title = fullTitle;
    setMeta("name", "description", description);
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description);
    setMeta("property", "og:type", "website");
    setMeta("property", "og:url", canonicalUrl);
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", description);

    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;
  }, [title, description]);

  return null;
}

function setMeta(attribute: "name" | "property", key: string, content: string) {
  let element = document.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
}
