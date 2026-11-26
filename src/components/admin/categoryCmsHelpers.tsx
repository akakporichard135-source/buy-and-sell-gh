import {
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Monitor,
  RotateCcw,
  Save,
  Smartphone,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import type { MediaItem } from "../../cms/types";

export function moveOrderedItem<T extends { order: number }>(
  list: T[],
  idx: number,
  dir: -1 | 1
): T[] {
  const nextIdx = idx + dir;
  if (nextIdx < 0 || nextIdx >= list.length) return list;
  const copy = [...list];
  const [item] = copy.splice(idx, 1);
  copy.splice(nextIdx, 0, item);
  return copy.map((el, i) => ({ ...el, order: i }));
}

interface CategoryAdminToolbarProps {
  testIdPrefix: string;
  title: string;
  subtitle: string;
  hasDraft: boolean;
  busyAction: "draft" | "publish" | null;
  previewMode: "none" | "desktop" | "mobile";
  statusBanner: { type: "success" | "error"; text: string } | null;
  onSetPreview: (mode: "none" | "desktop" | "mobile") => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  onDiscardDraft: () => void;
  onResetDefault: () => void;
  publishLabel: string;
  previewRenderer: ReactNode;
}

export function CategoryAdminToolbar({
  testIdPrefix,
  title,
  subtitle,
  hasDraft,
  busyAction,
  previewMode,
  statusBanner,
  onSetPreview,
  onSaveDraft,
  onPublish,
  onDiscardDraft,
  onResetDefault,
  publishLabel,
  previewRenderer,
}: CategoryAdminToolbarProps) {
  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[#d8a72d]" />
              <h3 className="text-base font-extrabold text-slate-900">{title}</h3>
              {hasDraft && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  Unsaved Draft Active
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              data-testid={`${testIdPrefix}-preview-desktop`}
              onClick={() => onSetPreview(previewMode === "desktop" ? "none" : "desktop")}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${
                previewMode === "desktop"
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <Monitor size={14} />
              <span>Desktop Preview</span>
            </button>

            <button
              type="button"
              data-testid={`${testIdPrefix}-preview-mobile`}
              onClick={() => onSetPreview(previewMode === "mobile" ? "none" : "mobile")}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${
                previewMode === "mobile"
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <Smartphone size={14} />
              <span>Mobile Preview</span>
            </button>

            <button
              type="button"
              disabled={busyAction !== null}
              onClick={onSaveDraft}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 disabled:opacity-50"
            >
              <Save size={14} />
              <span>{busyAction === "draft" ? "Saving..." : "Save Draft"}</span>
            </button>

            {hasDraft && (
              <button
                type="button"
                disabled={busyAction !== null}
                onClick={onDiscardDraft}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
              >
                <X size={14} />
                <span>Discard Draft</span>
              </button>
            )}

            <button
              type="button"
              disabled={busyAction !== null}
              onClick={onResetDefault}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
              title="Reset configuration to approved default template"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>

            <button
              type="button"
              disabled={busyAction !== null}
              onClick={onPublish}
              style={{ backgroundColor: "#d8a72d", color: "#111111" }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold shadow-sm hover:opacity-95 disabled:opacity-50"
            >
              <CheckCircle2 size={14} />
              <span>{busyAction === "publish" ? "Publishing..." : publishLabel}</span>
            </button>
          </div>
        </div>

        {statusBanner && (
          <div
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold ${
              statusBanner.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}
          >
            {statusBanner.type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
            <span>{statusBanner.text}</span>
          </div>
        )}
      </div>

      {previewMode !== "none" && (
        <div className="rounded-2xl border-2 border-[#d8a72d]/50 bg-slate-100 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
              Live {previewMode === "desktop" ? "Desktop (1440px)" : "Mobile (390px)"} Renderer Preview
            </span>
            <button
              type="button"
              onClick={() => onSetPreview("none")}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-white border border-slate-200 text-slate-700"
            >
              <X size={13} />
              <span>Close Preview</span>
            </button>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-300 bg-white shadow-inner">
            <div
              style={{
                width: previewMode === "mobile" ? 390 : "100%",
                marginInline: "auto",
                maxHeight: 680,
                overflowY: "auto",
              }}
            >
              {previewRenderer}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

interface ImageFieldControlProps {
  label: string;
  imageUrl: string;
  altText?: string;
  uploading: boolean;
  onImageChange: (url: string, alt?: string) => void;
  onUploadFile: (file: File) => void;
  onPickLibrary: (onSelect: (item: MediaItem) => void) => void;
}

export function ImageFieldControl({
  label,
  imageUrl,
  altText,
  uploading,
  onImageChange,
  onUploadFile,
  onPickLibrary,
}: ImageFieldControlProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
        {label}
      </label>
      <div className="flex items-center gap-2.5">
        <div className="h-14 w-16 shrink-0 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden p-1">
          {imageUrl ? (
            <img src={imageUrl} alt={altText || label} className="max-h-full max-w-full object-contain" />
          ) : (
            <ImageIcon size={18} className="text-slate-300" />
          )}
        </div>
        <div className="flex-1 min-w-0 space-y-1.5">
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => onImageChange(e.target.value)}
            placeholder="/products/... or https://..."
            className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-800"
          />
          <div className="flex flex-wrap items-center gap-1.5">
            <label className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-900 text-white cursor-pointer hover:bg-slate-800">
              <Upload size={12} />
              <span>{uploading ? "Uploading..." : "Upload Image"}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onUploadFile(file);
                  e.target.value = "";
                }}
              />
            </label>
            <button
              type="button"
              onClick={() => onPickLibrary((item) => onImageChange(item.url, item.alt || item.title))}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            >
              <ImageIcon size={12} />
              <span>Media Library</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
