import { Image as ImageIcon, RotateCcw, Upload } from "lucide-react";
import { defaultMainStoreConfig } from "../../cms/defaultCmsData";
import type { MainStoreFamilyItem } from "../../cms/types";

export interface ProductFamilyStripEditorProps {
  productFamilies?: MainStoreFamilyItem[];
  uploadingIndex: number | null;
  onUploadFile: (index: number, file: File, label: string) => void;
  onOpenMediaLibrary: (index: number) => void;
  onResetToDefault: (index: number) => void;
}

export function ProductFamilyStripEditor({
  productFamilies,
  uploadingIndex,
  onUploadFile,
  onOpenMediaLibrary,
  onResetToDefault,
}: ProductFamilyStripEditorProps) {
  const families =
    productFamilies && productFamilies.length > 0
      ? productFamilies
      : defaultMainStoreConfig.productFamilies;

  return (
    <div
      className="space-y-3"
      data-testid="product-family-strip-editor"
    >
      <div className="flex items-center justify-between pb-1">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Store Category Images ({families.length})
        </span>
        <span className="text-[0.7rem] text-slate-400">
          Recommended: Transparent PNG or WebP, 180×180px or higher
        </span>
      </div>

      <div className="space-y-2.5">
        {families.map((fam, idx) => {
          const defaultImg =
            defaultMainStoreConfig.productFamilies[idx]?.image || "";
          const isCustom = Boolean(fam.image && fam.image !== defaultImg);
          const isUploading = uploadingIndex === idx;

          return (
            <div
              key={fam.id || idx}
              data-testid={`family-category-row-${fam.id || idx}`}
              className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition hover:border-slate-300"
            >
              {/* Category Identity & Current Image Thumbnail */}
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white border border-slate-200 p-1.5 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-xs">
                  {fam.image ? (
                    <img
                      src={fam.image}
                      alt={fam.alt || fam.name}
                      data-testid={`family-current-img-${fam.id || idx}`}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-[0.65rem] text-slate-400">
                      No Image
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4
                      data-testid={`family-name-${fam.id || idx}`}
                      className="text-sm font-bold text-slate-900 truncate"
                    >
                      {fam.name}
                    </h4>
                    {isCustom ? (
                      <span className="px-2 py-0.5 rounded-full text-[0.65rem] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Custom Image
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[0.65rem] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    Store Link:{" "}
                    <span className="font-mono text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[0.7rem]">
                      {fam.path}
                    </span>
                  </p>
                </div>
              </div>

              {/* Actions: Upload Image from PC / Media Library / Reset to Default */}
              <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                <label
                  data-testid={`family-upload-btn-${fam.id || idx}`}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition ${
                    isUploading
                      ? "bg-slate-300 text-slate-600 cursor-wait"
                      : "bg-slate-900 hover:bg-slate-800 text-white"
                  }`}
                >
                  <Upload size={13} className="text-[#d4af37]" />
                  <span>{isUploading ? "Uploading..." : "Upload Image"}</span>
                  <input
                    type="file"
                    data-testid={`family-file-input-${fam.id || idx}`}
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    disabled={uploadingIndex !== null}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) onUploadFile(idx, file, fam.name);
                    }}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  data-testid={`family-media-btn-${fam.id || idx}`}
                  onClick={() => onOpenMediaLibrary(idx)}
                  className="px-3 py-1.5 rounded-lg bg-[#d4af37]/15 hover:bg-[#d4af37]/25 text-amber-900 font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <ImageIcon size={13} />
                  <span>Media Library</span>
                </button>

                {isCustom && (
                  <button
                    type="button"
                    data-testid={`family-reset-btn-${fam.id || idx}`}
                    onClick={() => onResetToDefault(idx)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white border border-transparent hover:border-slate-200 transition"
                    title="Reset to default image"
                    aria-label={`Reset ${fam.name} to default image`}
                  >
                    <RotateCcw size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
