import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useCms } from "../../cms/CmsContext";
import { defaultMainStoreConfig } from "../../cms/defaultCmsData";
import type { MainStoreConfig, StorePageSection } from "../../cms/types";
import { resolveBuiltInSectionBgStyle } from "./storeSectionStyle";

export function StoreQuickLinks({
  section,
  configOverride,
}: {
  section?: StorePageSection;
  configOverride?: MainStoreConfig;
}) {
  const { mainStore } = useCms();
  const activeConfig = configOverride || mainStore;
  const links = activeConfig?.quickLinks?.length
    ? activeConfig.quickLinks
    : defaultMainStoreConfig.quickLinks || [];

  if (links.length === 0) return null;

  const heading = section?.heading?.trim() || "Quick Links";
  const bgStyle = resolveBuiltInSectionBgStyle(section?.backgroundColor);

  return (
    <section
      className="store-section store-quick-links-section"
      aria-labelledby="store-quick-links-title"
      style={bgStyle}
      data-section-id={section?.id || "section-quick-links"}
    >
      <div className="store-container">
        <h2 id="store-quick-links-title" className="store-quick-links-heading">
          {heading}
        </h2>
        <nav className="store-quick-links-row" aria-label="Store quick links">
          {links.map((item) => {
            const isExternal = /^https?:\/\//i.test(item.to || "");
            if (isExternal) {
              return (
                <a
                  key={item.id || item.label}
                  href={item.to}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="store-quick-link-pill"
                >
                  <span>{item.label}</span>
                  <ArrowUpRight size={14} strokeWidth={2} aria-hidden="true" />
                </a>
              );
            }
            return (
              <Link
                key={item.id || item.to}
                to={item.to}
                className="store-quick-link-pill"
              >
                <span>{item.label}</span>
                <ArrowUpRight size={14} strokeWidth={2} aria-hidden="true" />
              </Link>
            );
          })}
        </nav>
      </div>
    </section>
  );
}
