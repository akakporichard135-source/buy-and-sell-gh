import { useEffect } from "react";
import { business } from "../config/business";

interface SEOProps {
  title: string;
  description: string;
  image?: string;
}

export function SEO({ title, description, image = "/products/story/iphone-18-pro-clean-frame.webp" }: SEOProps) {
  useEffect(() => {
    const fullTitle = title.includes("Buy & Sell GH") ? title : `${title} | Buy & Sell GH`;
    const canonicalUrl = new URL(window.location.pathname, `${business.siteUrl}/`).href;
    const socialImageUrl = new URL(image, `${business.siteUrl}/`).href;
    document.title = fullTitle;
    setMeta("name", "description", description);
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description);
    setMeta("property", "og:type", "website");
    setMeta("property", "og:url", canonicalUrl);
    setMeta("property", "og:image", socialImageUrl);
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:url", canonicalUrl);
    setMeta("name", "twitter:image", socialImageUrl);

    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;
  }, [title, description, image]);

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
