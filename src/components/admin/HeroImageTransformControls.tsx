import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Monitor,
  MoveHorizontal,
  MoveVertical,
  RotateCcw,
  Sliders,
  Smartphone,
  ZoomIn,
} from "lucide-react";
import { useState } from "react";
import {
  copyDesktopToMobileHeroTransform,
  hasCustomHeroImageTransform,
  HERO_IMAGE_OFFSET_DEFAULT,
  HERO_IMAGE_OFFSET_MAX,
  HERO_IMAGE_OFFSET_MIN,
  HERO_IMAGE_SCALE_DEFAULT,
  HERO_IMAGE_SCALE_MAX,
  HERO_IMAGE_SCALE_MIN,
  isHeroFramingNearBoundary,
  normalizeHeroImageTransform,
  resetHeroImageTransformViewport,
  resolveHeroImagePresentationStyle,
  sanitizeHeroImageTransformForStorage,
} from "../../cms/heroImageTransform";
import type { HomepageMediaFit, ResponsiveImageTransform, Tone } from "../../cms/types";

export interface HeroImageTransformControlsProps {
  slotKey: string;
  transform?: ResponsiveImageTransform;
  desktopImageUrl?: string;
  mobileImageUrl?: string;
  tone: Tone;
  backgroundColor: string;
  backgroundGradient?: string;
  mediaFit: HomepageMediaFit;
  mediaPosition?: string;
  blendMode: "normal" | "multiply";
  heading?: string;
  subtitle?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  onChange: (nextTransform: ResponsiveImageTransform | undefined) => void;
}

const SCALE_PRESETS = [80, 100, 115, 130] as const;

export function HeroImageTransformControls({
  slotKey,
  transform,
  desktopImageUrl,
  mobileImageUrl,
  tone,
  backgroundColor,
  backgroundGradient,
  mediaFit,
  mediaPosition = "bottom",
  blendMode,
  heading = "Hero Headline",
  subtitle = "Supporting campaign subtitle",
  primaryLabel = "Learn more",
  secondaryLabel = "Buy",
  onChange,
}: HeroImageTransformControlsProps) {
  const [mobilePreviewWidth, setMobilePreviewWidth] = useState<390 | 430>(390);
  const current = normalizeHeroImageTransform(transform);

  const desktopCustomized = hasCustomHeroImageTransform(current, "desktop");
  const mobileCustomized = hasCustomHeroImageTransform(current, "mobile");
  const anyCustomized = desktopCustomized || mobileCustomized;

  const updateField = (patch: Partial<ResponsiveImageTransform>) => {
    const merged = sanitizeHeroImageTransformForStorage({
      ...current,
      ...patch,
    });
    onChange(merged);
  };

  const desktopPreview = resolveHeroImagePresentationStyle({
    transform: current,
    isMobile: false,
    mediaFit,
    mediaPosition,
    mixBlendMode: tone === "dark" ? "normal" : blendMode,
  });

  const mobilePreview = resolveHeroImagePresentationStyle({
    transform: current,
    isMobile: true,
    mediaFit,
    mediaPosition,
    mixBlendMode: tone === "dark" ? "normal" : blendMode,
  });

  const effectiveMobileImg = mobileImageUrl || desktopImageUrl;
  const isDark = tone === "dark";
  const nearEdge =
    isHeroFramingNearBoundary({
      scale: current.desktopScale,
      offsetX: current.desktopOffsetX,
      offsetY: current.desktopOffsetY,
    }) ||
    isHeroFramingNearBoundary({
      scale: current.mobileScale,
      offsetX: current.mobileOffsetX,
      offsetY: current.mobileOffsetY,
    });

  return (
    <div
      data-testid={`hero-transform-panel-${slotKey}`}
      className="hero-transform-panel rounded-xl border border-slate-200 bg-white p-3.5 space-y-3.5 shadow-xs"
    >
      {/* Panel Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900">
            <Sliders size={14} className="text-[#b17d12] shrink-0" />
            <span>Hero Image Scale &amp; Position</span>
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
              anyCustomized
                ? "bg-[#fbf8ef] border-[#d4af37]/50 text-[#8c6411]"
                : "bg-slate-50 border-slate-200 text-slate-500"
            }`}
          >
            {anyCustomized ? "Custom Framing Active" : "Default Framing (100%)"}
          </span>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
              nearEdge
                ? "bg-amber-50 border-amber-200 text-amber-800"
                : "bg-emerald-50 border-emerald-200 text-emerald-700"
            }`}
          >
            {nearEdge ? (
              <>
                <AlertTriangle size={11} className="shrink-0" />
                <span>Near frame edge — verify headline clearance</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={11} className="shrink-0" />
                <span>Aspect ratio locked · Proportions preserved</span>
              </>
            )}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            data-testid={`hero-copy-desktop-to-mobile-${slotKey}`}
            onClick={() => onChange(copyDesktopToMobileHeroTransform(current))}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold transition"
            title="Copy desktop scale and position settings to mobile"
          >
            <Copy size={11} />
            <span>Copy Desktop &rarr; Mobile</span>
          </button>

          <button
            type="button"
            data-testid={`hero-reset-all-${slotKey}`}
            disabled={!anyCustomized}
            onClick={() => onChange(resetHeroImageTransformViewport(current, "all"))}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 text-slate-700 text-[11px] font-semibold disabled:opacity-40 disabled:pointer-events-none transition"
          >
            <RotateCcw size={11} />
            <span>Reset All</span>
          </button>
        </div>
      </div>

      {/* Live Dual-Viewport Hero Previews (Desktop 1440px + Mobile 390px / 430px) */}
      <div className="hero-transform-preview-grid">
        {/* Desktop Live Preview */}
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center justify-between gap-2 text-[11px]">
            <span className="inline-flex items-center gap-1.5 font-bold text-slate-700">
              <Monitor size={12} className="text-slate-500" />
              <span>Desktop Live Preview (1440px)</span>
            </span>
            <span className="font-mono text-[10px] text-slate-500">
              {current.desktopScale}% · X {current.desktopOffsetX >= 0 ? "+" : ""}
              {current.desktopOffsetX}% · Y {current.desktopOffsetY >= 0 ? "+" : ""}
              {current.desktopOffsetY}%
            </span>
          </div>

          <div
            data-testid={`hero-live-preview-desktop-${slotKey}`}
            className={`hero-live-stage hero-live-stage--desktop ${
              mediaFit === "cover" ? "is-cover" : "is-contain"
            } ${isDark ? "is-dark" : "is-light"}`}
            style={{
              backgroundColor,
              backgroundImage: backgroundGradient || undefined,
            }}
          >
            <div className="hero-live-stage__copy">
              <div className="hero-live-stage__title">{heading}</div>
              {subtitle ? <div className="hero-live-stage__subtitle">{subtitle}</div> : null}
              <div className="hero-live-stage__ctas">
                {primaryLabel ? (
                  <span className="hero-live-stage__btn is-primary">{primaryLabel}</span>
                ) : null}
                {secondaryLabel ? (
                  <span className="hero-live-stage__btn is-secondary">{secondaryLabel}</span>
                ) : null}
              </div>
            </div>

            {desktopImageUrl ? (
              <img
                data-testid={`hero-live-preview-desktop-img-${slotKey}`}
                src={desktopImageUrl}
                alt="Desktop hero live preview"
                className="hero-live-stage__img"
                style={desktopPreview.style}
                draggable={false}
              />
            ) : (
              <div className="hero-live-stage__empty">No desktop image selected</div>
            )}
          </div>
        </div>

        {/* Mobile Live Preview (390px / 430px toggle) */}
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-1.5 text-[11px]">
            <span className="inline-flex items-center gap-1.5 font-bold text-slate-700">
              <Smartphone size={12} className="text-slate-500" />
              <span>Mobile Live Preview</span>
            </span>
            <div className="inline-flex items-center gap-1">
              {([390, 430] as const).map((w) => (
                <button
                  key={w}
                  type="button"
                  data-testid={`hero-mobile-preview-width-${w}-${slotKey}`}
                  onClick={() => setMobilePreviewWidth(w)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition ${
                    mobilePreviewWidth === w
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {w}px
                </button>
              ))}
              <span className="font-mono text-[10px] text-slate-500 ml-1">
                {current.mobileScale}% · X {current.mobileOffsetX >= 0 ? "+" : ""}
                {current.mobileOffsetX}% · Y {current.mobileOffsetY >= 0 ? "+" : ""}
                {current.mobileOffsetY}%
              </span>
            </div>
          </div>

          <div className="hero-live-mobile-shell">
            <div
              data-testid={`hero-live-preview-mobile-${slotKey}`}
              data-preview-width={mobilePreviewWidth}
              className={`hero-live-stage hero-live-stage--mobile ${
                mobilePreviewWidth === 430 ? "is-430" : "is-390"
              } ${mediaFit === "cover" ? "is-cover" : "is-contain"} ${
                isDark ? "is-dark" : "is-light"
              }`}
              style={{
                backgroundColor,
                backgroundImage: backgroundGradient || undefined,
              }}
            >
              <div className="hero-live-stage__copy">
                <div className="hero-live-stage__title">{heading}</div>
                {subtitle ? <div className="hero-live-stage__subtitle">{subtitle}</div> : null}
                <div className="hero-live-stage__ctas">
                  {primaryLabel ? (
                    <span className="hero-live-stage__btn is-primary">{primaryLabel}</span>
                  ) : null}
                  {secondaryLabel ? (
                    <span className="hero-live-stage__btn is-secondary">{secondaryLabel}</span>
                  ) : null}
                </div>
              </div>

              {effectiveMobileImg ? (
                <img
                  data-testid={`hero-live-preview-mobile-img-${slotKey}`}
                  src={effectiveMobileImg}
                  alt="Mobile hero live preview"
                  className="hero-live-stage__img"
                  style={mobilePreview.style}
                  draggable={false}
                />
              ) : (
                <div className="hero-live-stage__empty">No mobile image selected</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Independent Desktop & Mobile Sliders */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3.5">
        {/* Desktop Controls Card */}
        <ViewportTransformCard
          title="Desktop Framing (≥ 769px)"
          icon={<Monitor size={13} className="text-[#8c6411]" />}
          slotKey={slotKey}
          viewportKey="desktop"
          scale={current.desktopScale}
          offsetX={current.desktopOffsetX}
          offsetY={current.desktopOffsetY}
          customized={desktopCustomized}
          onChangeScale={(val) => updateField({ desktopScale: val })}
          onChangeX={(val) => updateField({ desktopOffsetX: val })}
          onChangeY={(val) => updateField({ desktopOffsetY: val })}
          onReset={() => onChange(resetHeroImageTransformViewport(current, "desktop"))}
        />

        {/* Mobile Controls Card */}
        <ViewportTransformCard
          title="Mobile Framing (≤ 768px · 390px / 430px)"
          icon={<Smartphone size={13} className="text-[#8c6411]" />}
          slotKey={slotKey}
          viewportKey="mobile"
          scale={current.mobileScale}
          offsetX={current.mobileOffsetX}
          offsetY={current.mobileOffsetY}
          customized={mobileCustomized}
          onChangeScale={(val) => updateField({ mobileScale: val })}
          onChangeX={(val) => updateField({ mobileOffsetX: val })}
          onChangeY={(val) => updateField({ mobileOffsetY: val })}
          onReset={() => onChange(resetHeroImageTransformViewport(current, "mobile"))}
        />
      </div>
    </div>
  );
}

function ViewportTransformCard({
  title,
  icon,
  slotKey,
  viewportKey,
  scale,
  offsetX,
  offsetY,
  customized,
  onChangeScale,
  onChangeX,
  onChangeY,
  onReset,
}: {
  title: string;
  icon: React.ReactNode;
  slotKey: string;
  viewportKey: "desktop" | "mobile";
  scale: number;
  offsetX: number;
  offsetY: number;
  customized: boolean;
  onChangeScale: (next: number) => void;
  onChangeX: (next: number) => void;
  onChangeY: (next: number) => void;
  onReset: () => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200/90 bg-slate-50/75 p-3 space-y-3 min-w-0">
      <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-200/70">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-800">
          {icon}
          <span>{title}</span>
        </span>
        <button
          type="button"
          data-testid={`hero-reset-${viewportKey}-${slotKey}`}
          disabled={!customized}
          onClick={onReset}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 text-[10px] font-bold disabled:opacity-40 disabled:pointer-events-none transition"
        >
          <RotateCcw size={10} />
          <span>Reset {viewportKey === "desktop" ? "Desktop" : "Mobile"}</span>
        </button>
      </div>

      {/* 1. Image Scale */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor={`hero-${viewportKey}-scale-${slotKey}`}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700"
          >
            <ZoomIn size={12} className="text-slate-500" />
            <span>Image Scale</span>
          </label>
          <div className="flex items-center gap-1">
            {SCALE_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onChangeScale(preset)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition ${
                  scale === preset
                    ? "bg-[#d4af37] text-[#0a0a0c]"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {preset}%
              </button>
            ))}
            <div className="inline-flex items-center rounded-md border border-slate-200 bg-white px-1.5 py-0.5 ml-1">
              <input
                type="number"
                aria-label={`${viewportKey} image scale percentage`}
                data-testid={`hero-${viewportKey}-scale-input-${slotKey}`}
                min={HERO_IMAGE_SCALE_MIN}
                max={HERO_IMAGE_SCALE_MAX}
                step={1}
                value={scale}
                onChange={(e) => onChangeScale(Number(e.target.value))}
                className="w-10 text-right font-mono text-[11px] font-bold text-slate-800 focus:outline-none"
              />
              <span className="text-[10px] font-bold text-slate-400 ml-0.5">%</span>
            </div>
          </div>
        </div>
        <input
          id={`hero-${viewportKey}-scale-${slotKey}`}
          data-testid={`hero-${viewportKey}-scale-${slotKey}`}
          type="range"
          min={HERO_IMAGE_SCALE_MIN}
          max={HERO_IMAGE_SCALE_MAX}
          step={1}
          value={scale}
          onChange={(e) => onChangeScale(Number(e.target.value))}
          className="hero-transform-slider"
        />
      </div>

      {/* 2. Independent Horizontal Position (X) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor={`hero-${viewportKey}-x-${slotKey}`}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700"
          >
            <MoveHorizontal size={12} className="text-slate-500" />
            <span>Horizontal Position (X)</span>
          </label>
          <div className="flex items-center gap-1">
            {[
              { label: "Left", value: -15 },
              { label: "Center", value: HERO_IMAGE_OFFSET_DEFAULT },
              { label: "Right", value: 15 },
            ].map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => onChangeX(p.value)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition ${
                  offsetX === p.value
                    ? "bg-slate-900 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {p.label}
              </button>
            ))}
            <div className="inline-flex items-center rounded-md border border-slate-200 bg-white px-1.5 py-0.5 ml-1">
              <input
                type="number"
                aria-label={`${viewportKey} horizontal position percentage`}
                data-testid={`hero-${viewportKey}-x-input-${slotKey}`}
                min={HERO_IMAGE_OFFSET_MIN}
                max={HERO_IMAGE_OFFSET_MAX}
                step={1}
                value={offsetX}
                onChange={(e) => onChangeX(Number(e.target.value))}
                className="w-10 text-right font-mono text-[11px] font-bold text-slate-800 focus:outline-none"
              />
              <span className="text-[10px] font-bold text-slate-400 ml-0.5">%</span>
            </div>
          </div>
        </div>
        <input
          id={`hero-${viewportKey}-x-${slotKey}`}
          data-testid={`hero-${viewportKey}-x-${slotKey}`}
          type="range"
          min={HERO_IMAGE_OFFSET_MIN}
          max={HERO_IMAGE_OFFSET_MAX}
          step={1}
          value={offsetX}
          onChange={(e) => onChangeX(Number(e.target.value))}
          className="hero-transform-slider"
        />
      </div>

      {/* 3. Independent Vertical Position (Y) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor={`hero-${viewportKey}-y-${slotKey}`}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700"
          >
            <MoveVertical size={12} className="text-slate-500" />
            <span>Vertical Position (Y)</span>
          </label>
          <div className="flex items-center gap-1">
            {[
              { label: "Up", value: -12 },
              { label: "Base", value: HERO_IMAGE_OFFSET_DEFAULT },
              { label: "Down", value: 12 },
            ].map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => onChangeY(p.value)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition ${
                  offsetY === p.value
                    ? "bg-slate-900 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {p.label}
              </button>
            ))}
            <div className="inline-flex items-center rounded-md border border-slate-200 bg-white px-1.5 py-0.5 ml-1">
              <input
                type="number"
                aria-label={`${viewportKey} vertical position percentage`}
                data-testid={`hero-${viewportKey}-y-input-${slotKey}`}
                min={HERO_IMAGE_OFFSET_MIN}
                max={HERO_IMAGE_OFFSET_MAX}
                step={1}
                value={offsetY}
                onChange={(e) => onChangeY(Number(e.target.value))}
                className="w-10 text-right font-mono text-[11px] font-bold text-slate-800 focus:outline-none"
              />
              <span className="text-[10px] font-bold text-slate-400 ml-0.5">%</span>
            </div>
          </div>
        </div>
        <input
          id={`hero-${viewportKey}-y-${slotKey}`}
          data-testid={`hero-${viewportKey}-y-${slotKey}`}
          type="range"
          min={HERO_IMAGE_OFFSET_MIN}
          max={HERO_IMAGE_OFFSET_MAX}
          step={1}
          value={offsetY}
          onChange={(e) => onChangeY(Number(e.target.value))}
          className="hero-transform-slider"
        />
      </div>

      <p className="text-[10px] text-slate-500 leading-relaxed pt-0.5">
        Default is <strong>100% scale, 0% X, 0% Y</strong>. Negative X moves left, positive X moves right; negative Y raises upward, positive Y lowers downward.
      </p>
    </div>
  );
}
