import { ArrowDown, ArrowUp, Eye, Plus, Save, Send, Trash2, Upload } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { editorialStories } from "../../catalog/editorialStories";
import { useProductCatalog } from "../../catalog/ProductCatalogContext";
import { familyMatchesProduct, productFamilies, productStories, type ProductFamilyKey } from "../../catalog/productExperience";
import {
  fetchDraftLearnMore, fetchPublishedLearnMore, listLearnMoreMedia,
  publishLearnMore, saveDraftLearnMore, uploadLearnMoreMedia,
  type LearnMoreContent, type LearnMoreSection, type LearnMoreSectionType,
} from "../../cms/learnMoreRepository";
import { useCms } from "../../cms/CmsContext";
import { iphone18ProEducation } from "../../data/iphone18ProEducation";
import { macStudioStory } from "../../data/macStudioStory";
import { EditorialProductStory } from "../../components/EditorialProductStory";
import { CatalogProductStory, storyFromProduct } from "../ProductStoryPage";
import { MacLaunchPage } from "../MacLaunchPage";
import "../../styles/admin-learn-more.css";

const configuredChoices: LearnMoreContent[] = [
  ...Object.values(editorialStories).map((story) => ({
    kind: "editorial" as const, story, sections: [],
    ...(story.slug === "iphone-18-pro" ? { education: iphone18ProEducation } : {}),
  })),
  ...productStories.filter((story) => !editorialStories[story.slug])
    .map((story) => ({ kind: "catalog" as const, story, sections: [] })),
  { kind: "mac-studio", story: macStudioStory, sections: [] },
];

const sectionTypes: LearnMoreSectionType[] = [
  "text-image", "large-image", "gallery", "video", "highlights", "finishes",
  "camera", "performance", "battery", "specifications", "comparison", "cta",
];

const clone = <T,>(value: T): T => structuredClone(value);
const titleCase = (key: string) => key.replace(/([A-Z])/g, " $1").replace(/[-_]/g, " ").replace(/^./, (c) => c.toUpperCase());
const isMediaField = (key: string) => ["src", "mobileSrc", "poster", "image", "mobileImage", "video", "mobileVideo"].includes(key);

function placementsFor(content: LearnMoreContent): { value: string; label: string }[] {
  const choices = [{ value: "after-hero", label: "After hero" }];
  if (content.kind === "mac-studio") return [...choices,
    { value: "after-panels", label: "After feature panels" }, { value: "end", label: "Before pre-order" }];
  if (content.kind === "catalog") return [...choices,
    { value: "after-intro", label: "After introduction" },
    { value: "after-highlights", label: "After highlights" },
    { value: "after-film", label: "After film" },
    { value: "after-design", label: "After design" },
    { value: "after-colors", label: "After colours" },
    { value: "end", label: "Before final action" }];
  if (content.story.slug === "iphone-18-pro") return [...choices,
    { value: "after-overview", label: "After overview" },
    ...(content.education?.chapters || iphone18ProEducation.chapters).map((chapter) => ({
      value: `after-chapter:${chapter.id}`, label: `After ${chapter.label.toLowerCase()}`,
    })),
    { value: "end", label: "Before final product view" }];
  return [...choices, { value: "after-highlights", label: "After highlights" },
    { value: "after-hardware", label: "After hardware" },
    ...content.story.chapters.map((chapter) => ({ value: `after-chapter:${chapter.id}`, label: `After ${chapter.label.toLowerCase()}` })),
    { value: "after-information", label: "After information" },
    { value: "end", label: "Before final product view" }];
}

function StoryFields({ value, path, onChange, assets }: {
  value: unknown;
  path: (string | number)[];
  onChange: (path: (string | number)[], value: unknown) => void;
  assets: string[];
}) {
  if (Array.isArray(value)) return <div className="learn-editor-array">
    {value.map((item, index) => <details key={index} className="learn-editor-group">
      <summary>{typeof item === "object" ? `${titleCase(String(path[path.length - 1] || "Item"))} ${index + 1}` : String(item).slice(0, 60)}</summary>
      <div className="learn-editor-row-actions">
        <button type="button" disabled={index === 0} onClick={() => {
          const next = clone(value); [next[index - 1], next[index]] = [next[index], next[index - 1]]; onChange(path, next);
        }} aria-label="Move up"><ArrowUp size={16} /></button>
        <button type="button" disabled={index === value.length - 1} onClick={() => {
          const next = clone(value); [next[index + 1], next[index]] = [next[index], next[index + 1]]; onChange(path, next);
        }} aria-label="Move down"><ArrowDown size={16} /></button>
        <button type="button" onClick={() => {
          if (window.confirm("Delete this item from the draft?")) onChange(path, value.filter((_, i) => i !== index));
        }} aria-label="Delete item"><Trash2 size={16} /></button>
      </div>
      <StoryFields value={item} path={[...path, index]} onChange={onChange} assets={assets} />
    </details>)}
    <button type="button" className="learn-editor-small-button" onClick={() => {
      if (!value.length) {
        const list = String(path[path.length - 1]);
        const item = list === "imagesBefore" || list === "imagesAfter"
          ? { src: "", mobileSrc: "", alt: "", caption: "", className: "display" }
          : list === "lessons" || list === "audience"
            ? { title: "", explanation: "" }
            : list === "chapters"
              ? { ...clone(iphone18ProEducation.chapters[0]), id: crypto.randomUUID(), title: "New chapter", imagesBefore: [], imagesAfter: [], lessons: [], audience: [] }
              : "";
        onChange(path, [item]); return;
      }
      const added = clone(value[value.length - 1]);
      if (added && typeof added === "object" && "id" in added) added.id = crypto.randomUUID();
      onChange(path, [...value, added]);
    }}><Plus size={16} /> Add item</button>
  </div>;

  if (value && typeof value === "object") return <div className="learn-editor-fields">
    {Object.entries(value).map(([key, field]) => {
      const nextPath = [...path, key];
      if (field && typeof field === "object") return <details className="learn-editor-group" key={key}>
        <summary>{titleCase(key)}</summary>
        <StoryFields value={field} path={nextPath} onChange={onChange} assets={assets} />
      </details>;
      if (typeof field === "boolean") return <label className="learn-editor-checkbox" key={key}>
        <input type="checkbox" checked={field} onChange={(e) => onChange(nextPath, e.target.checked)} />{titleCase(key)}
      </label>;
      if (typeof field === "number") return <label key={key}>{titleCase(key)}
        <input type="number" value={field} onChange={(e) => onChange(nextPath, Number(e.target.value))} />
      </label>;
      const text = String(field ?? "");
      return <label key={key}>{titleCase(key)}
        {text.length > 100 || ["copy", "description", "intro"].includes(key)
          ? <textarea value={text} rows={3} onChange={(e) => onChange(nextPath, e.target.value)} />
          : <input value={text} disabled={key === "slug" || key === "family" || key === "id"}
            onChange={(e) => onChange(nextPath, e.target.value)} />}
        {isMediaField(key) && <select value="" onChange={(e) => e.target.value && onChange(nextPath, e.target.value)}>
          <option value="">Choose uploaded media...</option>
          {assets.map((url) => <option value={url} key={url}>{url.split("/").pop()}</option>)}
        </select>}
      </label>;
    })}
  </div>;

  return <input value={String(value ?? "")} onChange={(e) => onChange(path, e.target.value)} />;
}

function MediaField({ label, value, assets, onChange }: {
  label: string; value?: string; assets: string[]; onChange: (value: string) => void;
}) {
  return <label>{label}
    <input value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder="Media URL" />
    <select value="" onChange={(e) => e.target.value && onChange(e.target.value)}>
      <option value="">Choose from Media Library...</option>
      {assets.map((url) => <option key={url} value={url}>{url.split("/").pop()}</option>)}
    </select>
  </label>;
}

function SectionEditor({ section, index, count, assets, placements, onChange, onMove, onDelete }: {
  section: LearnMoreSection; index: number; count: number; assets: string[]; placements: { value: string; label: string }[];
  onChange: (section: LearnMoreSection) => void; onMove: (direction: -1 | 1) => void; onDelete: () => void;
}) {
  const change = (field: keyof LearnMoreSection, value: unknown) => onChange({ ...section, [field]: value });
  return <details className="learn-editor-group learn-editor-section">
    <summary>{index + 1}. {section.title || titleCase(section.type)}{!section.enabled ? " (hidden)" : ""}</summary>
    <div className="learn-editor-row-actions">
      <button type="button" disabled={index === 0} onClick={() => onMove(-1)} aria-label="Move section up"><ArrowUp size={16} /></button>
      <button type="button" disabled={index === count - 1} onClick={() => onMove(1)} aria-label="Move section down"><ArrowDown size={16} /></button>
      <label className="learn-editor-checkbox"><input type="checkbox" checked={section.enabled} onChange={(e) => change("enabled", e.target.checked)} />Visible</label>
      <button type="button" onClick={onDelete} aria-label="Delete section"><Trash2 size={16} /></button>
    </div>
    <div className="learn-editor-fields">
      <label>Place section<select value={section.placement || "end"} onChange={(e) => change("placement", e.target.value)}>
        {placements.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
      </select></label>
      <label>Section type<select value={section.type} onChange={(e) => change("type", e.target.value)}>
        {sectionTypes.map((type) => <option value={type} key={type}>{titleCase(type)}</option>)}
      </select></label>
      <label>Eyebrow<input value={section.eyebrow} onChange={(e) => change("eyebrow", e.target.value)} /></label>
      <label>Heading<input value={section.title} onChange={(e) => change("title", e.target.value)} /></label>
      <label>Description<textarea rows={4} value={section.body} onChange={(e) => change("body", e.target.value)} /></label>
      {section.type !== "video" && section.type !== "cta" && <>
        <MediaField label="Desktop image" value={section.image} assets={assets} onChange={(v) => change("image", v)} />
        <MediaField label="Mobile image" value={section.mobileImage} assets={assets} onChange={(v) => change("mobileImage", v)} />
        <label>Image description<input value={section.alt || ""} onChange={(e) => change("alt", e.target.value)} /></label>
        <label>Image fit<select value={section.fit || "contain"} onChange={(e) => change("fit", e.target.value)}><option value="contain">Contain</option><option value="cover">Cover</option></select></label>
        <label>Image position<input value={section.position || "center"} onChange={(e) => change("position", e.target.value)} /></label>
      </>}
      {section.type === "gallery" && <label>Gallery image URLs (one per line)<textarea rows={5}
        value={(section.images || []).join("\n")} onChange={(e) => change("images", e.target.value.split("\n").map((v) => v.trim()).filter(Boolean))} /></label>}
      {section.type === "video" && <>
        <MediaField label="Desktop video" value={section.video} assets={assets} onChange={(v) => change("video", v)} />
        <MediaField label="Mobile video" value={section.mobileVideo} assets={assets} onChange={(v) => change("mobileVideo", v)} />
        <MediaField label="Poster image" value={section.poster} assets={assets} onChange={(v) => change("poster", v)} />
        {(["autoplay", "muted", "loop", "controls"] as const).map((key) => <label className="learn-editor-checkbox" key={key}>
          <input type="checkbox" checked={Boolean(section[key])} disabled={key === "muted" && section.autoplay}
            onChange={(e) => change(key, e.target.checked)} />{titleCase(key)}
        </label>)}
      </>}
      {section.type === "cta" && <>
        <label>Button label<input value={section.buttonLabel || ""} onChange={(e) => change("buttonLabel", e.target.value)} /></label>
        <label>Button destination<input value={section.buttonTo || ""} onChange={(e) => change("buttonTo", e.target.value)} /></label>
      </>}
    </div>
  </details>;
}

export function AdminLearnMorePages() {
  const { media } = useCms();
  const { activeProducts } = useProductCatalog();
  const storyChoices = useMemo(() => {
    const configuredSlugs = new Set(configuredChoices.map((choice) => choice.story.slug));
    const generated = activeProducts.flatMap((product) => {
      if (configuredSlugs.has(product.slug)) return [];
      const family = (Object.keys(productFamilies) as ProductFamilyKey[])
        .find((key) => familyMatchesProduct(product, key));
      return family ? [{ kind: "catalog" as const, story: storyFromProduct(product, family), sections: [] }] : [];
    });
    return [...configuredChoices, ...generated];
  }, [activeProducts]);
  const [selected, setSelected] = useState(configuredChoices[0]?.story.slug || "");
  const [document, setDocument] = useState<LearnMoreContent | null>(null);
  const [uploadedAssets, setUploadedAssets] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(false);
  const assets = useMemo(() => [...new Set([...media.map((item) => item.url), ...uploadedAssets])], [media, uploadedAssets]);

  useEffect(() => {
    let active = true;
    const fallback = storyChoices.find((choice) => choice.story.slug === selected);
    setDocument(fallback ? clone(fallback) : null);
    setMessage(""); setError(""); setPreview(false);
    void Promise.all([fetchPublishedLearnMore(selected), fetchDraftLearnMore(selected), listLearnMoreMedia()])
      .then(([published, draft, storedAssets]) => {
        if (!active) return;
        const loaded = clone(draft || published || fallback || null);
        if (loaded?.kind === "editorial" && loaded.story.slug === "iphone-18-pro" && !loaded.education) {
          loaded.education = clone(iphone18ProEducation);
        }
        setDocument(loaded);
        setUploadedAssets(storedAssets);
      }).catch((cause) => {
        if (active) setError(`CMS unavailable: ${cause instanceof Error ? cause.message : String(cause)}. Apply migration 018 before saving.`);
      });
    return () => { active = false; };
  }, [selected, storyChoices]);

  const updateField = (root: "story" | "education", path: (string | number)[], value: unknown) => {
    setDocument((current) => {
      if (!current) return current;
      const next = clone(current) as unknown as Record<string, unknown>;
      let cursor = next[root] as Record<string, unknown>;
      for (const step of path.slice(0, -1)) cursor = cursor[step] as Record<string, unknown>;
      cursor[path[path.length - 1]] = value;
      return next as unknown as LearnMoreContent;
    });
  };

  const updateSection = (index: number, section: LearnMoreSection) => setDocument((current) => current ? {
    ...current, sections: current.sections.map((item, i) => i === index ? section : item),
  } : current);

  const save = async (publish: boolean) => {
    if (!document) return;
    if (publish && !window.confirm(`Publish changes to ${document.story.name} now?`)) return;
    setBusy(true); setError(""); setMessage("");
    try {
      if (publish) {
        await publishLearnMore(document);
        const verified = await fetchPublishedLearnMore(document.story.slug);
        if (!verified || JSON.stringify(verified) !== JSON.stringify(document)) throw new Error("Publish verification failed. Check Supabase before editing further.");
      } else await saveDraftLearnMore(document);
      setMessage(publish ? "Published. Refresh the public Learn More page to see the update." : "Draft saved privately.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : String(cause)); }
    finally { setBusy(false); }
  };

  const upload = async (file?: File) => {
    if (!file) return;
    setBusy(true); setUploadProgress(0); setError("");
    try {
      const url = await uploadLearnMoreMedia(file, setUploadProgress);
      setUploadedAssets((current) => [url, ...current]);
      setMessage("Media uploaded. Select it in a field, then save your draft.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : String(cause)); }
    finally { setBusy(false); }
  };

  return <div className="learn-editor">
    <header className="learn-editor-header"><div><h1>Learn More Pages</h1><p>Edit an existing product story, add media sections, preview, then publish.</p></div></header>
    <div className="learn-editor-toolbar">
      <label>Product page<select value={selected} onChange={(e) => setSelected(e.target.value)}>
        {storyChoices.map((choice) => <option key={`${choice.kind}-${choice.story.slug}`} value={choice.story.slug}>{choice.story.name}</option>)}
      </select></label>
      <label className="learn-editor-upload"><Upload size={17} /> Upload image or video
        <input type="file" accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm" disabled={busy}
          onChange={(e) => { void upload(e.target.files?.[0]); e.target.value = ""; }} />
      </label>
      {busy && uploadProgress > 0 && <span>Uploading {uploadProgress}%</span>}
    </div>
    {error && <p className="learn-editor-error" role="alert">{error}</p>}
    {message && <p className="learn-editor-message" role="status">{message}</p>}
    {document && <>
      <div className="learn-editor-actions">
        <button type="button" onClick={() => setPreview((current) => !current)}><Eye size={17} /> {preview ? "Edit" : "Preview"}</button>
        <button type="button" disabled={busy} onClick={() => void save(false)}><Save size={17} /> Save draft</button>
        <button type="button" disabled={busy} onClick={() => void save(true)}><Send size={17} /> Publish</button>
      </div>
      {preview ? <div className="learn-editor-preview">
        {document.kind === "editorial"
          ? <EditorialProductStory story={document.story} sections={document.sections} education={document.education} />
          : document.kind === "mac-studio"
            ? <MacLaunchPage product="mac-studio" preview={document} />
            : <CatalogProductStory family={document.story.family} slug={document.story.slug} published={document} />}
      </div> : <div className="learn-editor-panels">
        <section><h2>Existing page content</h2><StoryFields value={document.story} path={[]} onChange={(path, value) => updateField("story", path, value)} assets={assets} />
          {document.kind === "editorial" && document.education && <><h2>iPhone 18 Pro education</h2>
            <StoryFields value={document.education} path={[]} onChange={(path, value) => updateField("education", path, value)} assets={assets} /></>}
        </section>
        <section><h2>Additional sections</h2>
          {document.sections.map((section, index) => <SectionEditor key={section.id} section={section} index={index}
            count={document.sections.length} assets={assets} placements={placementsFor(document)} onChange={(next) => updateSection(index, next)}
            onMove={(direction) => setDocument((current) => {
              if (!current) return current;
              const sections = [...current.sections];
              [sections[index], sections[index + direction]] = [sections[index + direction], sections[index]];
              return { ...current, sections };
            })}
            onDelete={() => window.confirm("Delete this section from the draft?") && setDocument((current) =>
              current ? { ...current, sections: current.sections.filter((_, i) => i !== index) } : current)} />)}
          <button type="button" className="learn-editor-add" onClick={() => setDocument((current) => current ? {
            ...current, sections: [...current.sections, {
              id: crypto.randomUUID(), type: "text-image", enabled: true,
              eyebrow: "", title: "New section", body: "", fit: "contain",
            }],
          } : current)}><Plus size={17} /> Add section</button>
        </section>
      </div>}
    </>}
  </div>;
}
