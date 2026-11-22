import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, ImageOff, Maximize2, X } from "lucide-react";

export interface SwipeableGalleryImage {
  src: string;
  alt: string;
}

export interface SwipeableProductGalleryProps {
  images: SwipeableGalleryImage[];
  activeIndex: number;
  onSelectIndex: (index: number) => void;
  productName: string;
  darkStage?: boolean;
  className?: string;
  showCounter?: boolean;
  showThumbnails?: boolean;
  enableZoom?: boolean;
  activeColorKey?: string;
  activeColorLabel?: string;
}

export function SwipeableProductGallery({
  images,
  activeIndex,
  onSelectIndex,
  productName,
  darkStage = false,
  className = "",
  showCounter = true,
  showThumbnails = true,
  enableZoom = true,
  activeColorKey,
  activeColorLabel,
}: SwipeableProductGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const directionLockedRef = useRef<"horizontal" | "vertical" | null>(null);
  const mouseStartRef = useRef<{ x: number; isDown: boolean } | null>(null);
  const didDragRef = useRef(false);

  // Safe active index boundary clamp
  const total = images.length;
  const safeIndex = total > 0 ? Math.min(Math.max(0, activeIndex), total - 1) : 0;

  // Keep parent active index clamped if switching to a colour with fewer images
  useEffect(() => {
    if (total > 0 && activeIndex >= total) {
      onSelectIndex(0);
    }
  }, [total, activeIndex, onSelectIndex]);

  // Close zoom lightbox on Escape and support Left/Right arrow navigation while zoomed
  useEffect(() => {
    if (!zoomOpen) return;
    const handleLightboxKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setZoomOpen(false);
      } else if (e.key === "ArrowLeft" && safeIndex > 0) {
        e.preventDefault();
        onSelectIndex(safeIndex - 1);
      } else if (e.key === "ArrowRight" && safeIndex < total - 1) {
        e.preventDefault();
        onSelectIndex(safeIndex + 1);
      }
    };
    window.addEventListener("keydown", handleLightboxKey);
    return () => window.removeEventListener("keydown", handleLightboxKey);
  }, [zoomOpen, safeIndex, total, onSelectIndex]);

  // Touch event handlers for mobile devices
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (total <= 1) return;
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    directionLockedRef.current = null;
    didDragRef.current = false;
    setIsDragging(true);
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStartRef.current || total <= 1) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    if (!directionLockedRef.current) {
      if (Math.abs(deltaY) > 8 && Math.abs(deltaY) >= Math.abs(deltaX)) {
        directionLockedRef.current = "vertical";
        setIsDragging(false);
        setDragOffset(0);
        return;
      }
      if (Math.abs(deltaX) > 8 && Math.abs(deltaX) > Math.abs(deltaY)) {
        directionLockedRef.current = "horizontal";
        didDragRef.current = true;
      }
    }

    if (directionLockedRef.current === "horizontal") {
      if (e.cancelable) {
        e.preventDefault();
      }
      let resistanceDelta = deltaX;
      if ((safeIndex === 0 && deltaX > 0) || (safeIndex === total - 1 && deltaX < 0)) {
        resistanceDelta = deltaX * 0.32;
      }
      setDragOffset(resistanceDelta);
    }
  };

  const handleTouchEnd = () => {
    if (!touchStartRef.current) return;
    const isHorizontal = directionLockedRef.current === "horizontal";
    const offset = dragOffset;

    touchStartRef.current = null;
    directionLockedRef.current = null;
    setIsDragging(false);
    setDragOffset(0);

    if (isHorizontal) {
      const SWIPE_THRESHOLD = 40;
      if (offset < -SWIPE_THRESHOLD && safeIndex < total - 1) {
        onSelectIndex(safeIndex + 1);
      } else if (offset > SWIPE_THRESHOLD && safeIndex > 0) {
        onSelectIndex(safeIndex - 1);
      }
    }
  };

  // Mouse drag event handlers for desktop with window-level listeners
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (total <= 1) return;
    if (e.button !== 0) return;
    mouseStartRef.current = { x: e.clientX, isDown: true };
    didDragRef.current = false;
    setIsDragging(true);
    setDragOffset(0);
  };

  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      if (!mouseStartRef.current?.isDown || total <= 1) return;
      const deltaX = e.clientX - mouseStartRef.current.x;
      if (Math.abs(deltaX) > 6) {
        didDragRef.current = true;
      }
      let resistanceDelta = deltaX;
      if ((safeIndex === 0 && deltaX > 0) || (safeIndex === total - 1 && deltaX < 0)) {
        resistanceDelta = deltaX * 0.32;
      }
      setDragOffset(resistanceDelta);
    };

    const handleWindowMouseUp = (e: MouseEvent) => {
      if (!mouseStartRef.current?.isDown) return;
      const deltaX = e.clientX - mouseStartRef.current.x;
      mouseStartRef.current = null;
      setIsDragging(false);
      setDragOffset(0);

      const DRAG_THRESHOLD = 45;
      if (deltaX < -DRAG_THRESHOLD && safeIndex < total - 1) {
        onSelectIndex(safeIndex + 1);
      } else if (deltaX > DRAG_THRESHOLD && safeIndex > 0) {
        onSelectIndex(safeIndex - 1);
      }
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleWindowMouseMove);
      window.addEventListener("mouseup", handleWindowMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleWindowMouseMove);
      window.removeEventListener("mouseup", handleWindowMouseUp);
    };
  }, [isDragging, safeIndex, total, onSelectIndex]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (total <= 1) return;
      if (e.key === "ArrowLeft" && safeIndex > 0) {
        e.preventDefault();
        onSelectIndex(safeIndex - 1);
      } else if (e.key === "ArrowRight" && safeIndex < total - 1) {
        e.preventDefault();
        onSelectIndex(safeIndex + 1);
      }
    },
    [safeIndex, total, onSelectIndex]
  );

  const prevImage = () => {
    if (safeIndex > 0) {
      onSelectIndex(safeIndex - 1);
    }
  };

  const nextImage = () => {
    if (safeIndex < total - 1) {
      onSelectIndex(safeIndex + 1);
    }
  };

  if (!images || images.length === 0) {
    const emptyLabel = activeColorLabel
      ? `${productName} (${activeColorLabel}) photos coming soon`
      : `${productName} image coming soon`;
    return (
      <div
        className={`apple-buy-stage ${darkStage ? "apple-buy-stage-dark" : ""} ${className}`}
        data-active-color-key={activeColorKey}
        data-active-color={activeColorLabel}
        data-image-count={0}
      >
        <div className="apple-buy-stage-placeholder" role="img" aria-label={emptyLabel}>
          <ImageOff size={40} strokeWidth={1.5} aria-hidden="true" />
          <span>{activeColorLabel ? `${activeColorLabel} photos coming soon` : "Image coming soon"}</span>
        </div>
      </div>
    );
  }

  const currentImage = images[safeIndex] ?? images[0];

  return (
    <div
      className={`apple-buy-swipe-gallery-wrapper ${className}`}
      data-testid="product-color-gallery"
      data-active-color-key={activeColorKey}
      data-active-color={activeColorLabel}
      data-image-count={total}
    >
      {/* Viewport Stage: Single large image visible at a time with subtle arrows, zoom & mouse/touch drag */}
      <div
        ref={containerRef}
        className={`apple-buy-stage apple-buy-swipe-stage ${darkStage ? "apple-buy-stage-dark" : ""} ${
          isDragging ? "is-dragging" : ""
        }`}
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label={`${productName}${activeColorLabel ? ` in ${activeColorLabel}` : ""} gallery, showing image ${safeIndex + 1} of ${total}`}
        onKeyDown={handleKeyDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        {/* Slides Track: Keyed by activeColorKey for smooth Apple-style cross-fade when switching colour */}
        <div
          key={activeColorKey || "default"}
          className="apple-buy-swipe-track apple-buy-color-fade"
          style={{
            transform: `translateX(calc(-${safeIndex * 100}% + ${dragOffset}px))`,
            transition: isDragging ? "none" : "transform 0.36s cubic-bezier(0.25, 1, 0.5, 1)",
          }}
        >
          {images.map((img, idx) => (
            <div
              key={`${img.src}-${idx}`}
              className="apple-buy-swipe-slide"
              aria-hidden={idx !== safeIndex}
            >
              <img
                src={img.src}
                alt={img.alt || `${productName}${activeColorLabel ? ` in ${activeColorLabel}` : ""} angle ${idx + 1}`}
                className="apple-buy-stage-img"
                data-testid={idx === safeIndex ? "gallery-main-image" : undefined}
                loading={idx === 0 ? "eager" : "lazy"}
                fetchPriority={idx === 0 ? "high" : "low"}
                decoding="async"
                draggable={false}
                onClick={() => {
                  if (enableZoom && !didDragRef.current) {
                    setZoomOpen(true);
                  }
                }}
              />
            </div>
          ))}
        </div>

        {/* Zoom / Expand Control */}
        {enableZoom && (
          <button
            type="button"
            className="apple-buy-zoom-btn"
            data-testid="gallery-zoom-btn"
            onClick={(e) => {
              e.stopPropagation();
              setZoomOpen(true);
            }}
            aria-label={`Zoom ${productName} image`}
            title="Inspect full image"
          >
            <Maximize2 size={15} strokeWidth={2} />
          </button>
        )}

        {/* Desktop Prev Navigation Arrow */}
        {total > 1 && (
          <button
            type="button"
            className={`apple-buy-nav-btn apple-buy-nav-btn-prev ${safeIndex === 0 ? "is-disabled" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
            disabled={safeIndex === 0}
            aria-label="Previous product image"
            title="Previous image (Left arrow)"
          >
            <ChevronLeft size={20} strokeWidth={2.2} />
          </button>
        )}

        {/* Desktop Next Navigation Arrow */}
        {total > 1 && (
          <button
            type="button"
            className={`apple-buy-nav-btn apple-buy-nav-btn-next ${safeIndex === total - 1 ? "is-disabled" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            disabled={safeIndex === total - 1}
            aria-label="Next product image"
            title="Next image (Right arrow)"
          >
            <ChevronRight size={20} strokeWidth={2.2} />
          </button>
        )}

        {/* Discreet Image Counter Badge */}
        {total > 1 && showCounter && (
          <div className="apple-buy-counter-badge" aria-hidden="true">
            {safeIndex + 1} / {total}
          </div>
        )}
      </div>

      {/* Apple-Style Colour-Scoped Clickable Thumbnails (never changes selected colour) */}
      {showThumbnails && total > 1 && (
        <div
          className="apple-buy-thumbnails"
          role="group"
          aria-label={`${productName}${activeColorLabel ? ` (${activeColorLabel})` : ""} thumbnails`}
          data-testid="gallery-thumbnails"
        >
          {images.map((img, idx) => {
            const isActive = idx === safeIndex;
            return (
              <button
                key={`${activeColorKey || "c"}-${img.src}-${idx}-thumb`}
                type="button"
                data-testid={`gallery-thumb-${idx}`}
                aria-pressed={isActive}
                aria-label={`Show image ${idx + 1} of ${total}: ${img.alt || productName}`}
                className={`apple-buy-thumb ${isActive ? "is-selected" : ""}`}
                onClick={() => onSelectIndex(idx)}
              >
                <img
                  src={img.src}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Elegant Apple Pagination Dots */}
      {total > 1 && (
        <div
          className="apple-buy-pagination-dots"
          role="tablist"
          aria-label={`${productName} image pagination`}
        >
          {images.map((img, idx) => {
            const isActive = idx === safeIndex;
            return (
              <button
                key={`${img.src}-${idx}-dot`}
                type="button"
                role="tab"
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                className={`apple-buy-dot ${isActive ? "is-active" : ""}`}
                onClick={() => onSelectIndex(idx)}
                aria-label={`View image ${idx + 1} of ${total}: ${img.alt || productName}`}
                title={`Image ${idx + 1} of ${total}`}
              >
                <span className="apple-buy-dot-inner" />
              </button>
            );
          })}
        </div>
      )}

      {/* Full-Resolution Zoom Lightbox Modal */}
      {enableZoom && zoomOpen && currentImage && (
        <div
          className="apple-buy-lightbox-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={`${productName}${activeColorLabel ? ` in ${activeColorLabel}` : ""} zoomed view`}
          data-testid="gallery-zoom-modal"
          onClick={() => setZoomOpen(false)}
        >
          <div className="apple-buy-lightbox-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="apple-buy-lightbox-header">
              <span className="apple-buy-lightbox-caption">
                {productName}
                {activeColorLabel ? ` — ${activeColorLabel}` : ""}
                {total > 1 ? ` (${safeIndex + 1} / ${total})` : ""}
              </span>
              <button
                type="button"
                className="apple-buy-lightbox-close"
                data-testid="gallery-zoom-close"
                onClick={() => setZoomOpen(false)}
                aria-label="Close zoomed image"
              >
                <X size={20} />
              </button>
            </div>
            <div className="apple-buy-lightbox-stage">
              {total > 1 && (
                <button
                  type="button"
                  className={`apple-buy-nav-btn apple-buy-nav-btn-prev ${safeIndex === 0 ? "is-disabled" : ""}`}
                  onClick={prevImage}
                  disabled={safeIndex === 0}
                  aria-label="Previous image"
                >
                  <ChevronLeft size={20} strokeWidth={2.2} />
                </button>
              )}
              <img
                src={currentImage.src}
                alt={currentImage.alt || productName}
                className="apple-buy-lightbox-img"
              />
              {total > 1 && (
                <button
                  type="button"
                  className={`apple-buy-nav-btn apple-buy-nav-btn-next ${safeIndex === total - 1 ? "is-disabled" : ""}`}
                  onClick={nextImage}
                  disabled={safeIndex === total - 1}
                  aria-label="Next image"
                >
                  <ChevronRight size={20} strokeWidth={2.2} />
                </button>
              )}
            </div>
            {total > 1 && (
              <div className="apple-buy-thumbnails apple-buy-lightbox-thumbs">
                {images.map((img, idx) => (
                  <button
                    key={`zoom-${img.src}-${idx}`}
                    type="button"
                    className={`apple-buy-thumb ${idx === safeIndex ? "is-selected" : ""}`}
                    onClick={() => onSelectIndex(idx)}
                    aria-label={`View zoomed image ${idx + 1}`}
                  >
                    <img src={img.src} alt="" aria-hidden="true" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
