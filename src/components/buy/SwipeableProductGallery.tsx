import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";

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
}

export function SwipeableProductGallery({
  images,
  activeIndex,
  onSelectIndex,
  productName,
  darkStage = false,
  className = "",
}: SwipeableProductGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const directionLockedRef = useRef<"horizontal" | "vertical" | null>(null);
  const mouseStartRef = useRef<{ x: number; isDown: boolean } | null>(null);

  // Safe active index boundary clamp
  const total = images.length;
  const safeIndex = total > 0 ? Math.min(Math.max(0, activeIndex), total - 1) : 0;

  // Touch event handlers for mobile
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (total <= 1) return;
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    directionLockedRef.current = null;
    setIsDragging(true);
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStartRef.current || total <= 1) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    // Determine swipe axis if not yet locked
    if (!directionLockedRef.current) {
      if (Math.abs(deltaY) > 8 && Math.abs(deltaY) >= Math.abs(deltaX)) {
        directionLockedRef.current = "vertical";
        setIsDragging(false);
        setDragOffset(0);
        return;
      }
      if (Math.abs(deltaX) > 8 && Math.abs(deltaX) > Math.abs(deltaY)) {
        directionLockedRef.current = "horizontal";
      }
    }

    if (directionLockedRef.current === "horizontal") {
      // Prevent browser bounce / history swipe
      if (e.cancelable) {
        e.preventDefault();
      }

      // Add resistance at boundaries
      let resistanceDelta = deltaX;
      if ((safeIndex === 0 && deltaX > 0) || (safeIndex === total - 1 && deltaX < 0)) {
        resistanceDelta = deltaX * 0.35;
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
      const SWIPE_THRESHOLD = 45;
      if (offset < -SWIPE_THRESHOLD && safeIndex < total - 1) {
        onSelectIndex(safeIndex + 1);
      } else if (offset > SWIPE_THRESHOLD && safeIndex > 0) {
        onSelectIndex(safeIndex - 1);
      }
    }
  };

  // Mouse event handlers for desktop dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (total <= 1) return;
    // Only primary mouse button
    if (e.button !== 0) return;
    mouseStartRef.current = { x: e.clientX, isDown: true };
    setIsDragging(true);
    setDragOffset(0);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mouseStartRef.current?.isDown || total <= 1) return;
    const deltaX = e.clientX - mouseStartRef.current.x;
    let resistanceDelta = deltaX;
    if ((safeIndex === 0 && deltaX > 0) || (safeIndex === total - 1 && deltaX < 0)) {
      resistanceDelta = deltaX * 0.35;
    }
    setDragOffset(resistanceDelta);
  };

  const handleMouseUp = () => {
    if (!mouseStartRef.current?.isDown) return;
    const offset = dragOffset;
    mouseStartRef.current = null;
    setIsDragging(false);
    setDragOffset(0);

    const DRAG_THRESHOLD = 50;
    if (offset < -DRAG_THRESHOLD && safeIndex < total - 1) {
      onSelectIndex(safeIndex + 1);
    } else if (offset > DRAG_THRESHOLD && safeIndex > 0) {
      onSelectIndex(safeIndex - 1);
    }
  };

  const handleMouseLeave = () => {
    if (mouseStartRef.current?.isDown) {
      handleMouseUp();
    }
  };

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
    return (
      <div className={`apple-buy-stage ${darkStage ? "apple-buy-stage-dark" : ""} ${className}`}>
        <div className="apple-buy-stage-placeholder" role="img" aria-label={`${productName} image coming soon`}>
          <ImageOff size={40} strokeWidth={1.5} aria-hidden="true" />
          <span>Image coming soon</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`apple-buy-swipe-gallery-wrapper ${className}`}>
      {/* Viewport Stage */}
      <div
        ref={containerRef}
        className={`apple-buy-stage apple-buy-swipe-stage ${darkStage ? "apple-buy-stage-dark" : ""} ${
          isDragging ? "is-dragging" : ""
        }`}
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label={`${productName} gallery, showing image ${safeIndex + 1} of ${total}`}
        onKeyDown={handleKeyDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {/* Slides Track */}
        <div
          className="apple-buy-swipe-track"
          style={{
            transform: `translateX(calc(-${safeIndex * 100}% + ${dragOffset}px))`,
            transition: isDragging ? "none" : "transform 0.35s cubic-bezier(0.25, 1, 0.5, 1)",
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
                alt={img.alt || `${productName} view ${idx + 1}`}
                className="apple-buy-stage-img"
                loading={idx === 0 ? "eager" : "lazy"}
                fetchPriority={idx === 0 ? "high" : "low"}
                decoding="async"
                draggable={false}
              />
            </div>
          ))}
        </div>

        {/* Desktop Prev Navigation Arrow */}
        {total > 1 && safeIndex > 0 && (
          <button
            type="button"
            className="apple-buy-nav-btn apple-buy-nav-btn-prev"
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
            aria-label="Previous product image"
            title="Previous image (Left arrow)"
          >
            <ChevronLeft size={20} strokeWidth={2.2} />
          </button>
        )}

        {/* Desktop Next Navigation Arrow */}
        {total > 1 && safeIndex < total - 1 && (
          <button
            type="button"
            className="apple-buy-nav-btn apple-buy-nav-btn-next"
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            aria-label="Next product image"
            title="Next image (Right arrow)"
          >
            <ChevronRight size={20} strokeWidth={2.2} />
          </button>
        )}
      </div>

      {/* Elegant Pagination Dots */}
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
    </div>
  );
}
