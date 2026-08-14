import { Archive, ArrowLeft, ArrowRight, Edit3, ImagePlus, Plus, RefreshCw, RotateCcw, Save, Search, Trash2 } from "lucide-react";
import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useProductCatalog } from "../../catalog/ProductCatalogContext";
import { categories, createProductSlug, getPrimaryImage, normalizeProduct, productConditions, stockStatuses } from "../../catalog/productCatalog";
import { uploadProductImage } from "../../catalog/supabaseProductRepository";
import type { Product, ProductImage } from "../../types/product";
import { formatGhs } from "../../utils/format";
import { hasOwnerUploadedProductImages, isUsedProductCondition } from "../../utils/productImages";

const listToText = (items?: string[]) => (items ?? []).join("\n");
const textToList = (value: string) => value.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);

interface ProductFormState {
  id: string;
  slug: string;
  name: string;
  category: Product["category"];
  subcategory: string;
  brand: "Apple";
  model: string;
  generation: string;
  condition: Product["condition"];
  price: string;
  previousPrice: string;
  priceOnRequest: boolean;
  stockQuantity: string;
  stockStatus: Product["stockStatus"];
  storage: string;
  colors: string;
  defaultColor: string;
  batteryHealth: string;
  warranty: string;
  shortDescription: string;
  description: string;
  specifications: string;
  includedItems: string;
  deliveryInfo: string;
  images: ProductImage[];
  primaryImageIndex: number;
  featured: boolean;
  newArrival: boolean;
  popular: boolean;
  available: boolean;
  archived: boolean;
  createdAt?: string;
}

const productToForm = (product: Product): ProductFormState => ({
  id: product.id,
  slug: product.slug,
  name: product.name,
  category: product.category,
  subcategory: product.subcategory ?? "",
  brand: product.brand,
  model: product.model,
  generation: product.generation ?? "",
  condition: product.condition,
  price: String(product.price),
  previousPrice: product.previousPrice || product.oldPrice ? String(product.previousPrice ?? product.oldPrice) : "",
  priceOnRequest: product.priceOnRequest ?? false,
  stockQuantity: String(product.stockQuantity),
  stockStatus: product.stockStatus,
  storage: listToText(product.storage),
  colors: listToText(product.colors),
  defaultColor: product.defaultColor ?? product.colors[0] ?? "",
  batteryHealth: product.batteryHealth ?? "",
  warranty: product.warranty ?? product.warrantyInfo ?? "",
  shortDescription: product.shortDescription ?? "",
  description: product.description,
  specifications: listToText(product.specifications ?? product.specs),
  includedItems: listToText(product.includedItems ?? product.box),
  deliveryInfo: product.deliveryInfo ?? product.deliveryNote ?? "",
  images: product.images,
  primaryImageIndex: product.primaryImageIndex ?? 0,
  featured: product.featured ?? product.isFeatured ?? false,
  newArrival: product.newArrival ?? product.isNewArrival ?? false,
  popular: product.popular ?? product.isPopular ?? false,
  available: product.available ?? true,
  archived: product.archived ?? false,
  createdAt: product.createdAt,
});

export function AdminProductManager() {
  const { products, saveProduct, archiveProduct, deleteProduct, markSold, markOutOfStock, resetToSeedCatalog, createDraftProduct, backendStatus, loading, error } = useProductCatalog();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [condition, setCondition] = useState("All");
  const [stock, setStock] = useState("All");
  const [availability, setAvailability] = useState("All");
  const [editing, setEditing] = useState<ProductFormState | null>(null);
  const [editorFocusRequest, setEditorFocusRequest] = useState(0);
  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [saving, setSaving] = useState(false);
  const editorRef = useRef<HTMLElement>(null);
  const productNameRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return products.filter((product) => {
      const searchable = [product.name, product.slug, product.model, product.category, product.condition, product.stockStatus, ...(product.tags ?? [])].join(" ").toLowerCase();
      return terms.every((term) => searchable.includes(term)) &&
        (category === "All" || product.category === category) &&
        (condition === "All" || product.condition === condition) &&
        (stock === "All" || product.stockStatus === stock) &&
        (availability === "All" ||
          (availability === "Published" && product.available !== false && !product.archived) ||
          (availability === "Hidden" && product.available === false && !product.archived) ||
          (availability === "Archived" && product.archived === true));
    });
  }, [availability, category, condition, products, query, stock]);

  useEffect(() => {
    if (!editing || editorFocusRequest === 0) return;
    let focusTimer = 0;
    const animationFrame = window.requestAnimationFrame(() => {
      editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      focusTimer = window.setTimeout(() => productNameRef.current?.focus({ preventScroll: true }), 450);
    });
    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(focusTimer);
    };
  }, [editorFocusRequest]);

  const startAdd = () => {
    setMessage("");
    setActionError("");
    setEditing(productToForm(createDraftProduct()));
    setEditorFocusRequest((request) => request + 1);
  };

  const startEdit = (product: Product) => {
    setMessage("");
    setActionError("");
    setEditing(productToForm(product));
    setEditorFocusRequest((request) => request + 1);
  };

  const runAction = async (action: () => Promise<void>, success: string) => {
    setActionError("");
    try {
      await action();
      setMessage(success);
    } catch (actionFailure) {
      setActionError(actionFailure instanceof Error ? actionFailure.message : "Action failed. Check Supabase permissions and try again.");
    }
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing || saving) return;
    const normalized = formToProduct(editing, products);
    if (!normalized.priceOnRequest && (!Number.isFinite(normalized.price) || normalized.price <= 0)) {
      setActionError("Enter a confirmed Ghana cedi price greater than 0, or turn on Contact for Price before saving.");
      return;
    }
    if (normalized.available && !normalized.archived && isUsedProductCondition(normalized.condition) && !hasOwnerUploadedProductImages(normalized)) {
      setActionError("Upload real photos of this exact device to Supabase Storage before publishing it.");
      return;
    }
    setSaving(true);
    setActionError("");
    try {
      const saved = await saveProduct(normalized);
      setEditing(productToForm(saved));
      setMessage(`${normalized.name} saved. Changes now power the homepage, shop, search and product details.`);
    } catch (saveFailure) {
      setActionError(saveFailure instanceof Error ? saveFailure.message : "Product could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page-grid">
      <section className="admin-panel admin-panel-hero">
        <div>
          <p className="eyebrow-dark">Product Management</p>
          <h2>Catalogue control</h2>
          <p>Manage the product source used by homepage sections, shop filters, search, product details, cart and enquiries. Current persistence: {getBackendLabel(backendStatus)}.</p>
        </div>
        <button className="btn-primary" type="button" onClick={startAdd}><Plus size={17} /> Add Product</button>
      </section>

      {message && <div className="admin-success" role="status" aria-live="polite">{message}</div>}
      {(actionError || error) && <div className="admin-error" role="alert">{actionError || error}</div>}
      {backendStatus !== "supabase" && <div className="admin-warning">Supabase is not connected for production catalogue writes. Configure `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, migrations, RLS and Storage before using this as live inventory.</div>}

      <section className="admin-panel">
        <div className="admin-product-toolbar">
          <label className="admin-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products..." /></label>
          <label className="admin-toolbar-filter"><span>Category</span><select value={category} onChange={(event) => setCategory(event.target.value)}><option>All</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="admin-toolbar-filter"><span>Condition</span><select value={condition} onChange={(event) => setCondition(event.target.value)}><option>All</option>{productConditions.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="admin-toolbar-filter"><span>Stock</span><select value={stock} onChange={(event) => setStock(event.target.value)}><option>All</option>{stockStatuses.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="admin-toolbar-filter"><span>Availability</span><select value={availability} onChange={(event) => setAvailability(event.target.value)}><option>All</option><option>Published</option><option>Hidden</option><option>Archived</option></select></label>
          <button className="btn-secondary" type="button" onClick={() => window.confirm("Reset the local catalogue fallback to the approved seed catalogue?") && resetToSeedCatalog()} disabled={backendStatus === "supabase"}><RotateCcw size={17} /> Reset Local</button>
        </div>

        <div className="admin-product-list">
          {loading && <div className="rounded-lg border border-black/7 bg-white p-5 text-sm font-black text-ink/65">Loading catalogue...</div>}
          {!loading && filtered.map((product) => {
            const image = getPrimaryImage(product);
            return (
              <article className={`admin-product-row ${product.archived ? "is-archived" : ""} ${editing?.id === product.id ? "is-selected" : ""}`} key={product.id}>
                {image ? <img src={image.src} alt={image.alt} loading="lazy" /> : <div className="admin-product-image-empty">No image</div>}
                <div>
                  <strong>{product.name}</strong>
                  <span>{product.category} | {product.condition} | {product.priceOnRequest || product.price <= 0 ? "Contact for Price" : formatGhs(product.price)}</span>
                  <small>{product.stockStatus} | Qty {product.stockQuantity} | {product.available === false ? "Hidden" : "Published"} | {product.featured ? "Featured" : "Not featured"} | {product.newArrival ? "New arrival" : "Standard"}</small>
                </div>
                <div className="admin-product-actions">
                  <button type="button" onClick={() => startEdit(product)}><Edit3 size={15} /> Edit</button>
                  <button type="button" onClick={() => window.confirm(`Mark ${product.name} as sold?`) && void runAction(() => markSold(product.id), `${product.name} marked sold.`)}>Sold</button>
                  <button type="button" onClick={() => window.confirm(`Mark ${product.name} out of stock?`) && void runAction(() => markOutOfStock(product.id), `${product.name} marked out of stock.`)}>Out</button>
                  <button type="button" onClick={() => window.confirm(`Archive ${product.name}? It will disappear from public catalogue views.`) && void runAction(() => archiveProduct(product.id), `${product.name} archived.`)}><Archive size={15} /> Archive</button>
                  <button className="danger" type="button" onClick={() => window.confirm(`Permanently delete ${product.name}?`) && void runAction(() => deleteProduct(product.id), `${product.name} deleted.`)}><Trash2 size={15} /> Delete</button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {editing && (
        <section className="admin-panel admin-product-editor" ref={editorRef} tabIndex={-1} aria-labelledby="admin-product-editor-title">
          <div className="admin-section-title">
            <div>
              <p className="eyebrow-dark">{editing.name ? "Edit product" : "Add product"}</p>
              <h2 id="admin-product-editor-title">{editing.name || "New product"}</h2>
            </div>
            <button className="btn-secondary" type="button" onClick={() => setEditing(null)}>Cancel</button>
          </div>
          <ProductForm form={editing} setForm={setEditing} onSubmit={handleSave} products={products} backendStatus={backendStatus} saving={saving} setActionError={setActionError} productNameRef={productNameRef} />
        </section>
      )}
    </div>
  );
}

function ProductForm({ form, setForm, onSubmit, products, backendStatus, saving, setActionError, productNameRef }: { form: ProductFormState; setForm: (form: ProductFormState) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void; products: Product[]; backendStatus: string; saving: boolean; setActionError: (message: string) => void; productNameRef: React.RefObject<HTMLInputElement | null> }) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);
  const update = <K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) => setForm({ ...form, [key]: value });
  const updateImage = (index: number, field: keyof ProductImage, value: string) => update("images", form.images.map((image, itemIndex) => (itemIndex === index ? { ...image, [field]: value } : image)));
  const removeImage = (index: number) => {
    const images = form.images.filter((_, itemIndex) => itemIndex !== index);
    const primaryImageIndex = index < form.primaryImageIndex
      ? form.primaryImageIndex - 1
      : index === form.primaryImageIndex
        ? Math.min(index, Math.max(0, images.length - 1))
        : form.primaryImageIndex;
    setForm({ ...form, images, primaryImageIndex });
  };
  const moveImage = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= form.images.length) return;
    const next = [...form.images];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    const primaryImageIndex = form.primaryImageIndex === index
      ? nextIndex
      : form.primaryImageIndex === nextIndex
        ? index
        : form.primaryImageIndex;
    setForm({ ...form, images: next, primaryImageIndex });
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    if (backendStatus !== "supabase") {
      setActionError("Connect Supabase Storage before uploading production product images.");
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    setActionError("");
    try {
      const nextImages = [...form.images];
      for (const file of Array.from(files)) {
        if (nextImages.some((image) => image.alt === file.name.replace(/\.[^.]+$/, ""))) continue;
        const image = await uploadProductImage(file, form.id, setUploadProgress);
        nextImages.push({ ...image, alt: `${form.name || "Product"} image` });
      }
      update("images", nextImages);
    } catch (uploadFailure) {
      setActionError(uploadFailure instanceof Error ? uploadFailure.message : "Image upload failed.");
    } finally {
      setUploading(false);
      window.setTimeout(() => setUploadProgress(0), 900);
    }
  };

  const replaceImage = async (index: number, file?: File) => {
    if (!file) return;
    if (backendStatus !== "supabase") {
      setActionError("Connect Supabase Storage before replacing production product images.");
      return;
    }
    setUploading(true);
    setReplacingIndex(index);
    setUploadProgress(0);
    setActionError("");
    try {
      const uploaded = await uploadProductImage(file, form.id, setUploadProgress);
      const images = form.images.map((image, imageIndex) => imageIndex === index
        ? { ...uploaded, alt: image.alt || `${form.name || "Product"} image` }
        : image);
      setForm({ ...form, images });
    } catch (uploadFailure) {
      setActionError(uploadFailure instanceof Error ? uploadFailure.message : "Image replacement failed.");
    } finally {
      setUploading(false);
      setReplacingIndex(null);
      window.setTimeout(() => setUploadProgress(0), 900);
    }
  };

  return (
    <form className="admin-product-form" onSubmit={onSubmit}>
      <AdminFieldset title="Basic Information">
        <label>Product name<input ref={productNameRef} required value={form.name} onChange={(event) => update("name", event.target.value)} onBlur={() => update("slug", createProductSlug(form.name, products.filter((product) => product.id !== form.id), form.id))} /></label>
        <label>Category<select value={form.category} onChange={(event) => update("category", event.target.value as Product["category"])}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Subcategory / family<input value={form.subcategory} onChange={(event) => update("subcategory", event.target.value)} placeholder="MacBook Air, AirPods Pro, Charging & Power..." /></label>
        <label>Model<input required value={form.model} onChange={(event) => update("model", event.target.value)} /></label>
        <label>Generation<input value={form.generation} onChange={(event) => update("generation", event.target.value)} /></label>
        <label>Product URL slug<input required readOnly value={form.slug} aria-describedby="product-slug-help" /></label>
        <label className="admin-field-wide">Description<textarea required value={form.description} onChange={(event) => update("description", event.target.value)} placeholder="Customer-facing product description" /></label>
        <p className="admin-field-help admin-field-wide" id="product-slug-help">The URL slug is generated from the product name and protected from accidental edits.</p>
      </AdminFieldset>

      <AdminFieldset title="Pricing">
        <label>Confirmed price (GHS)<input required type="number" min="0" step="0.01" inputMode="decimal" value={form.price} onChange={(event) => update("price", event.target.value)} /></label>
        <label>Previous price (GHS)<input type="number" min="0" step="0.01" inputMode="decimal" value={form.previousPrice} onChange={(event) => update("previousPrice", event.target.value)} /></label>
        <label className="admin-check"><input type="checkbox" checked={form.priceOnRequest} onChange={(event) => update("priceOnRequest", event.target.checked)} /> Contact for Price</label>
        <div className={`admin-price-status admin-field-wide ${form.priceOnRequest ? "is-enquiry" : Number(form.price) > 0 ? "is-confirmed" : "is-warning"}`}>
          <strong>{form.priceOnRequest ? "Customers will see Contact for Price" : Number(form.price) > 0 ? `Customers will see ${formatGhs(Number(form.price))}` : "A confirmed price is required"}</strong>
          <span>{form.priceOnRequest ? "You may keep a draft amount here, but it will not be shown publicly or become purchasable." : "Cart and Buy Now also require valid stock and published availability."}</span>
        </div>
      </AdminFieldset>

      <AdminFieldset title="Condition">
        <label>Product condition<select value={form.condition} onChange={(event) => update("condition", event.target.value as Product["condition"])}>{productConditions.map((item) => <option key={item}>{item}</option>)}</select></label>
      </AdminFieldset>

      <AdminFieldset title="Inventory">
        <label>Stock quantity<input required type="number" min="0" inputMode="numeric" value={form.stockQuantity} onChange={(event) => update("stockQuantity", event.target.value)} /></label>
        <label>Stock status<select value={form.stockStatus} onChange={(event) => update("stockStatus", event.target.value as Product["stockStatus"])}>{stockStatuses.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="admin-check"><input type="checkbox" checked={form.available} onChange={(event) => update("available", event.target.checked)} /> Published in public catalogue</label>
        <label className="admin-check"><input type="checkbox" checked={form.archived} onChange={(event) => update("archived", event.target.checked)} /> Archived</label>
      </AdminFieldset>

      <AdminFieldset title="Options">
        <label>Storage / configuration options<textarea value={form.storage} onChange={(event) => update("storage", event.target.value)} placeholder="One option per line" /></label>
        <label>Colour options<textarea value={form.colors} onChange={(event) => update("colors", event.target.value)} placeholder="One colour per line" /></label>
        <label>Default colour<input value={form.defaultColor} onChange={(event) => update("defaultColor", event.target.value)} /></label>
      </AdminFieldset>

      <AdminFieldset title="Product Details">
        <label>Short description<textarea value={form.shortDescription} onChange={(event) => update("shortDescription", event.target.value)} /></label>
        <label>Specifications<textarea value={form.specifications} onChange={(event) => update("specifications", event.target.value)} placeholder="One specification per line" /></label>
        <label>Included items<textarea value={form.includedItems} onChange={(event) => update("includedItems", event.target.value)} placeholder="One item per line" /></label>
        <label>Delivery information<textarea value={form.deliveryInfo} onChange={(event) => update("deliveryInfo", event.target.value)} /></label>
        <label>Battery health<input value={form.batteryHealth} onChange={(event) => update("batteryHealth", event.target.value)} /></label>
        <label>Warranty<input value={form.warranty} onChange={(event) => update("warranty", event.target.value)} /></label>
      </AdminFieldset>

      <AdminFieldset title="Product Images">
        {isUsedProductCondition(form.condition) && (
          <div className={`admin-photo-requirement ${hasOwnerUploadedProductImages(form) ? "is-ready" : ""}`}>
            <strong>{hasOwnerUploadedProductImages(form) ? "Real product photos uploaded" : "Real product photos required"}</strong>
            <span>{hasOwnerUploadedProductImages(form) ? "Uploaded photos will appear before catalogue reference images." : "Upload real photos of this exact device before publishing. Premium catalogue renders are not shown publicly for used-condition products."}</span>
          </div>
        )}
        <div className="admin-image-list">
          {form.images.map((image, index) => (
            <div className={`admin-image-card ${form.primaryImageIndex === index ? "is-primary" : ""}`} key={`${image.src}-${index}`}>
              <div className="admin-image-preview">
                {image.src ? <img src={image.src} alt={image.alt || `${form.name} image ${index + 1}`} /> : <span>No image</span>}
                {form.primaryImageIndex === index && <strong>Primary image</strong>}
              </div>
              <label>Image description<input value={image.alt} onChange={(event) => updateImage(index, "alt", event.target.value)} placeholder="Describe this product image" /></label>
              <div className="admin-image-actions">
                <button type="button" disabled={uploading || form.primaryImageIndex === index} onClick={() => update("primaryImageIndex", index)}>Set primary</button>
                <button type="button" aria-label={`Move image ${index + 1} left`} disabled={uploading || index === 0} onClick={() => moveImage(index, -1)}><ArrowLeft size={15} /> Move</button>
                <button type="button" aria-label={`Move image ${index + 1} right`} disabled={uploading || index === form.images.length - 1} onClick={() => moveImage(index, 1)}>Move <ArrowRight size={15} /></button>
                <label className="admin-image-replace"><RefreshCw size={15} /> {replacingIndex === index ? "Replacing..." : "Replace"}<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={uploading} onChange={(event) => void replaceImage(index, event.target.files?.[0])} /></label>
                <button className="danger" type="button" disabled={uploading} onClick={() => window.confirm("Remove this image from the product after you save?") && removeImage(index)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
        {form.images.length === 0 && <div className="admin-image-empty-state">No product images yet. Upload the exact product photos below.</div>}
        <label className="admin-upload-control"><span><ImagePlus size={18} /> Upload new product images</span>
          <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple disabled={backendStatus !== "supabase" || uploading} onChange={(event) => void handleFileUpload(event.target.files)} />
        </label>
        {uploading && <div className="admin-upload-progress"><span style={{ width: `${uploadProgress}%` }} /></div>}
      </AdminFieldset>

      <AdminFieldset title="Promotion">
        <label className="admin-check"><input type="checkbox" checked={form.featured} onChange={(event) => update("featured", event.target.checked)} /> Featured</label>
        <label className="admin-check"><input type="checkbox" checked={form.newArrival} onChange={(event) => update("newArrival", event.target.checked)} /> New Arrival</label>
        <label className="admin-check"><input type="checkbox" checked={form.popular} onChange={(event) => update("popular", event.target.checked)} /> Popular Choice</label>
      </AdminFieldset>

      <div className="admin-save-bar">
        <span>{form.priceOnRequest ? "Enquiry-only until a confirmed price and valid inventory are published." : "Confirmed price. Purchase actions also follow stock and availability."}</span>
        <button className="btn-primary" type="submit" disabled={saving || uploading}><Save size={17} /> {saving ? "Saving Product..." : "Save Product"}</button>
      </div>
    </form>
  );
}

function getBackendLabel(status: string) {
  if (status === "supabase") return "Supabase";
  if (status === "error") return "Supabase error";
  if (status === "local-catalog") return "development local catalogue";
  if (status === "supabase-unconfigured") return "Supabase not configured";
  return "seed catalogue fallback";
}

function AdminFieldset({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="admin-form-section">
      <legend>{title}</legend>
      <div>{children}</div>
    </fieldset>
  );
}

function formToProduct(form: ProductFormState, products: Product[]): Product {
  const existing = products.find((product) => product.id === form.id);
  const storage = textToList(form.storage);
  const colors = textToList(form.colors);
  const quantity = Math.max(0, Number(form.stockQuantity) || 0);
  const stockStatus = form.stockStatus === "Sold" ? "Sold" : quantity === 0 ? "Out of Stock" : form.stockStatus;
  const specifications = textToList(form.specifications);
  const includedItems = textToList(form.includedItems);
  const validImages = form.images.filter((image) => image.src.trim());
  const selectedPrimaryImage = form.images[form.primaryImageIndex];
  const primaryImageIndex = Math.max(0, selectedPrimaryImage ? validImages.indexOf(selectedPrimaryImage) : 0);

  return normalizeProduct({
    ...(existing ?? {}),
    id: form.id,
    slug: form.slug,
    name: form.name,
    brand: form.brand,
    category: form.category,
    subcategory: form.subcategory,
    model: form.model,
    generation: form.generation,
    price: Number(form.price) || 0,
    previousPrice: form.previousPrice ? Number(form.previousPrice) : undefined,
    priceOnRequest: form.priceOnRequest,
    condition: form.condition,
    storage,
    colors,
    defaultColor: form.defaultColor || colors[0] || "",
    batteryHealth: form.batteryHealth,
    warranty: form.warranty,
    warrantyInfo: form.warranty,
    shortDescription: form.shortDescription,
    description: form.description,
    specifications,
    specs: specifications,
    includedItems,
    box: includedItems,
    deliveryInfo: form.deliveryInfo,
    deliveryNote: form.deliveryInfo,
    images: validImages,
    primaryImageIndex,
    stockQuantity: quantity,
    stockStatus,
    imageTone: existing?.imageTone ?? "from-white via-zinc-100 to-yellow-100",
    badges: [form.newArrival ? "New Arrival" : "", form.condition, stockStatus === "Sold" ? "Sold" : ""].filter(Boolean),
    featured: form.featured,
    newArrival: form.newArrival,
    popular: form.popular,
    available: form.available && stockStatus !== "Sold",
    archived: form.archived,
    tags: textToList(`${form.name},${form.model},${form.category},${form.storage},${form.colors}`),
    createdAt: form.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as Product);
}
