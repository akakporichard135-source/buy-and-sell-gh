import { Archive, Edit3, ImagePlus, Plus, RotateCcw, Save, Search, Trash2 } from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";
import { useProductCatalog } from "../../catalog/ProductCatalogContext";
import { categories, createProductSlug, getPrimaryImage, normalizeProduct, productConditions, stockStatuses } from "../../catalog/productCatalog";
import { removeProductImage, uploadProductImage } from "../../catalog/supabaseProductRepository";
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
  const [editing, setEditing] = useState<ProductFormState | null>(null);
  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return products.filter((product) => {
      const searchable = [product.name, product.slug, product.model, product.category, product.condition, product.stockStatus, ...(product.tags ?? [])].join(" ").toLowerCase();
      return terms.every((term) => searchable.includes(term)) &&
        (category === "All" || product.category === category) &&
        (condition === "All" || product.condition === condition) &&
        (stock === "All" || product.stockStatus === stock);
    });
  }, [category, condition, products, query, stock]);

  const startAdd = () => {
    setMessage("");
    setEditing(productToForm(createDraftProduct()));
  };

  const startEdit = (product: Product) => {
    setMessage("");
    setEditing(productToForm(product));
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
    if (!editing) return;
    const normalized = formToProduct(editing, products);
    if (normalized.available && !normalized.archived && isUsedProductCondition(normalized.condition) && !hasOwnerUploadedProductImages(normalized)) {
      setActionError("Upload real photos of this exact device to Supabase Storage before publishing it.");
      return;
    }
    setSaving(true);
    setActionError("");
    try {
      await saveProduct(normalized);
      setEditing(null);
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

      {message && <div className="admin-success">{message}</div>}
      {(actionError || error) && <div className="admin-error">{actionError || error}</div>}
      {backendStatus !== "supabase" && <div className="admin-warning">Supabase is not connected for production catalogue writes. Configure `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, migrations, RLS and Storage before using this as live inventory.</div>}

      <section className="admin-panel">
        <div className="admin-product-toolbar">
          <label className="admin-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products..." /></label>
          <select value={category} onChange={(event) => setCategory(event.target.value)}><option>All</option>{categories.map((item) => <option key={item}>{item}</option>)}</select>
          <select value={condition} onChange={(event) => setCondition(event.target.value)}><option>All</option>{productConditions.map((item) => <option key={item}>{item}</option>)}</select>
          <select value={stock} onChange={(event) => setStock(event.target.value)}><option>All</option>{stockStatuses.map((item) => <option key={item}>{item}</option>)}</select>
          <button className="btn-secondary" type="button" onClick={() => window.confirm("Reset the local catalogue fallback to the approved seed catalogue?") && resetToSeedCatalog()} disabled={backendStatus === "supabase"}><RotateCcw size={17} /> Reset Local</button>
        </div>

        <div className="admin-product-list">
          {loading && <div className="rounded-lg border border-black/7 bg-white p-5 text-sm font-black text-ink/65">Loading catalogue...</div>}
          {!loading && filtered.map((product) => {
            const image = getPrimaryImage(product);
            return (
              <article className={`admin-product-row ${product.archived ? "is-archived" : ""}`} key={product.id}>
                {image ? <img src={image.src} alt={image.alt} loading="lazy" /> : <div className="admin-product-image-empty">No image</div>}
                <div>
                  <strong>{product.name}</strong>
                  <span>{product.category} | {product.condition} | {formatGhs(product.price)}</span>
                  <small>{product.stockStatus} | Qty {product.stockQuantity} | {product.featured ? "Featured" : "Not featured"} | {product.newArrival ? "New arrival" : "Standard"}</small>
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
        <section className="admin-panel">
          <div className="admin-section-title">
            <div>
              <p className="eyebrow-dark">{editing.name ? "Edit product" : "Add product"}</p>
              <h2>{editing.name || "New product"}</h2>
            </div>
            <button className="btn-secondary" type="button" onClick={() => setEditing(null)}>Cancel</button>
          </div>
          <ProductForm form={editing} setForm={setEditing} onSubmit={handleSave} products={products} backendStatus={backendStatus} saving={saving} setActionError={setActionError} />
        </section>
      )}
    </div>
  );
}

function ProductForm({ form, setForm, onSubmit, products, backendStatus, saving, setActionError }: { form: ProductFormState; setForm: (form: ProductFormState) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void; products: Product[]; backendStatus: string; saving: boolean; setActionError: (message: string) => void }) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const update = <K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) => setForm({ ...form, [key]: value });
  const addImage = () => update("images", [...form.images, { src: "", alt: form.name || "Product image" }]);
  const updateImage = (index: number, field: keyof ProductImage, value: string) => update("images", form.images.map((image, itemIndex) => (itemIndex === index ? { ...image, [field]: value } : image)));
  const removeImage = async (index: number) => {
    const image = form.images[index];
    const images = form.images.filter((_, itemIndex) => itemIndex !== index);
    const primaryImageIndex = index < form.primaryImageIndex
      ? form.primaryImageIndex - 1
      : index === form.primaryImageIndex
        ? Math.min(index, Math.max(0, images.length - 1))
        : form.primaryImageIndex;
    setForm({ ...form, images, primaryImageIndex });
    if (backendStatus === "supabase" && image?.src.includes("/product-images/")) {
      try {
        await removeProductImage(image.src);
      } catch {
        setActionError("Image was removed from the product, but storage deletion failed. Check bucket permissions.");
      }
    }
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

  return (
    <form className="admin-product-form" onSubmit={onSubmit}>
      <AdminFieldset title="Basic Information">
        <label>Product name<input required value={form.name} onChange={(event) => update("name", event.target.value)} onBlur={() => update("slug", createProductSlug(form.name, products.filter((product) => product.id !== form.id), form.id))} /></label>
        <label>Slug<input required value={form.slug} onChange={(event) => update("slug", event.target.value)} /></label>
        <label>Category<select value={form.category} onChange={(event) => update("category", event.target.value as Product["category"])}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Subcategory<input value={form.subcategory} onChange={(event) => update("subcategory", event.target.value)} /></label>
        <label>Model<input required value={form.model} onChange={(event) => update("model", event.target.value)} /></label>
        <label>Generation<input value={form.generation} onChange={(event) => update("generation", event.target.value)} /></label>
        <label>Condition<select value={form.condition} onChange={(event) => update("condition", event.target.value as Product["condition"])}>{productConditions.map((item) => <option key={item}>{item}</option>)}</select></label>
      </AdminFieldset>

      <AdminFieldset title="Pricing">
        <label>Price<input required type="number" min="0" value={form.price} onChange={(event) => update("price", event.target.value)} /></label>
        <label>Previous price<input type="number" min="0" value={form.previousPrice} onChange={(event) => update("previousPrice", event.target.value)} /></label>
        <label className="admin-check"><input type="checkbox" checked={form.priceOnRequest} onChange={(event) => update("priceOnRequest", event.target.checked)} /> Price on request</label>
      </AdminFieldset>

      <AdminFieldset title="Inventory">
        <label>Quantity<input required type="number" min="0" value={form.stockQuantity} onChange={(event) => update("stockQuantity", event.target.value)} /></label>
        <label>Stock status<select value={form.stockStatus} onChange={(event) => update("stockStatus", event.target.value as Product["stockStatus"])}>{stockStatuses.map((item) => <option key={item}>{item}</option>)}</select></label>
      </AdminFieldset>

      <AdminFieldset title="Configuration">
        <label>Storage<textarea value={form.storage} onChange={(event) => update("storage", event.target.value)} placeholder="One per line or comma-separated" /></label>
        <label>Colours<textarea value={form.colors} onChange={(event) => update("colors", event.target.value)} /></label>
        <label>Default colour<input value={form.defaultColor} onChange={(event) => update("defaultColor", event.target.value)} /></label>
        <label>Battery health<input value={form.batteryHealth} onChange={(event) => update("batteryHealth", event.target.value)} /></label>
        <label>Warranty<input value={form.warranty} onChange={(event) => update("warranty", event.target.value)} /></label>
      </AdminFieldset>

      <AdminFieldset title="Product Content">
        <label>Short description<textarea value={form.shortDescription} onChange={(event) => update("shortDescription", event.target.value)} /></label>
        <label>Full description<textarea required value={form.description} onChange={(event) => update("description", event.target.value)} /></label>
        <label>Specifications<textarea value={form.specifications} onChange={(event) => update("specifications", event.target.value)} /></label>
        <label>Included items<textarea value={form.includedItems} onChange={(event) => update("includedItems", event.target.value)} /></label>
        <label>Delivery information<textarea value={form.deliveryInfo} onChange={(event) => update("deliveryInfo", event.target.value)} /></label>
      </AdminFieldset>

      <AdminFieldset title="Images">
        {isUsedProductCondition(form.condition) && (
          <div className={`admin-photo-requirement ${hasOwnerUploadedProductImages(form) ? "is-ready" : ""}`}>
            <strong>{hasOwnerUploadedProductImages(form) ? "Real product photos uploaded" : "Real product photos required"}</strong>
            <span>{hasOwnerUploadedProductImages(form) ? "Uploaded photos will appear before catalogue reference images." : "Upload real photos of this exact device before publishing. Premium catalogue renders are not shown publicly for used-condition products."}</span>
          </div>
        )}
        <div className="admin-image-list">
          {form.images.map((image, index) => (
            <div className="admin-image-row" key={`${image.src}-${index}`}>
              <input value={image.src} onChange={(event) => updateImage(index, "src", event.target.value)} placeholder="Image URL or imported asset path" />
              <input value={image.alt} onChange={(event) => updateImage(index, "alt", event.target.value)} placeholder="Image alt text" />
              <button type="button" onClick={() => update("primaryImageIndex", index)}>{form.primaryImageIndex === index ? "Primary" : "Set primary"}</button>
              <button type="button" onClick={() => moveImage(index, -1)}>Up</button>
              <button type="button" onClick={() => moveImage(index, 1)}>Down</button>
              <button type="button" onClick={() => void removeImage(index)}>Remove</button>
            </div>
          ))}
        </div>
        <label className="admin-upload-control">Upload product images
          <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple disabled={backendStatus !== "supabase" || uploading} onChange={(event) => void handleFileUpload(event.target.files)} />
        </label>
        {uploading && <div className="admin-upload-progress"><span style={{ width: `${uploadProgress}%` }} /></div>}
        <button className="btn-secondary" type="button" onClick={addImage}><ImagePlus size={17} /> Add Image</button>
      </AdminFieldset>

      <AdminFieldset title="Homepage Visibility">
        <label className="admin-check"><input type="checkbox" checked={form.featured} onChange={(event) => update("featured", event.target.checked)} /> Featured</label>
        <label className="admin-check"><input type="checkbox" checked={form.newArrival} onChange={(event) => update("newArrival", event.target.checked)} /> New Arrival</label>
        <label className="admin-check"><input type="checkbox" checked={form.popular} onChange={(event) => update("popular", event.target.checked)} /> Popular Choice</label>
        <label className="admin-check"><input type="checkbox" checked={form.available} onChange={(event) => update("available", event.target.checked)} /> Visible in public catalogue</label>
        <label className="admin-check"><input type="checkbox" checked={form.archived} onChange={(event) => update("archived", event.target.checked)} /> Archived</label>
      </AdminFieldset>

      <button className="btn-primary" type="submit" disabled={saving}><Save size={17} /> {saving ? "Saving..." : "Save Product"}</button>
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
