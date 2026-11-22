import React, { useEffect, useRef, useState } from "react";
import { ImagePlus, Pause, Play, Video } from "lucide-react";
import {
  resolveEffectiveMediaMode,
  resolveResponsiveVideoPlayback,
} from "../../cms/homepageBuilderUtils";
import { resolveHeroImagePresentationStyle } from "../../cms/heroImageTransform";
import { useResolvedMediaUrl } from "../../cms/localMediaStore";
import type {
  HomepageMediaFit,
  HomepageMediaFocalPoint,
  HomepageMediaMode,
  ResponsiveImageTransform,
  Tone,
} from "../../cms/types";

export interface HomepageMediaSlotProps {
  slotId?: string;
  slotLabel?: string;
  mediaMode?: HomepageMediaMode;
  desktopImage?: string;
  mobileImage?: string;
  videoUrl?: string;
  mobileVideoUrl?: string;
  posterUrl?: string;
  mobilePosterUrl?: string;
  videoAutoplay?: boolean;
  videoMuted?: boolean;
  videoLoop?: boolean;
  imageAlt?: string;
  focalPoint?: HomepageMediaFocalPoint;
  objectFit?: HomepageMediaFit;
  imageTransform?: ResponsiveImageTransform;
  tone?: Tone;
  backgroundColor?: string;
  caption?: string;
  variant?: "hero" | "promo-banner" | "promo-panel" | "bento-tile" | "story-card";
  priority?: boolean;
  className?: string;
  adminInteractive?: boolean;
  onAdminSelectSlot?: () => void;
}

const FOCAL_POINT_MAP: Record<HomepageMediaFocalPoint, string> = {
  center: "center center",
  top: "center top",
  bottom: "center bottom",
  left: "left center",
  right: "right center",
};

export const HomepageMediaSlot: React.FC<HomepageMediaSlotProps> = ({
  slotLabel,
  mediaMode,
  desktopImage,
  mobileImage,
  videoUrl,
  mobileVideoUrl,
  posterUrl,
  mobilePosterUrl,
  videoAutoplay = true,
  videoMuted = true,
  videoLoop = true,
  imageAlt = "",
  focalPoint = "bottom",
  objectFit = "contain",
  imageTransform,
  tone = "dark",
  backgroundColor,
  caption,
  variant = "hero",
  priority = false,
  className = "",
  adminInteractive = false,
  onAdminSelectSlot,
}) => {
  const { resolvedUrl: resolvedDesktop } = useResolvedMediaUrl(desktopImage);
  const { resolvedUrl: resolvedMobile } = useResolvedMediaUrl(mobileImage);
  const { resolvedUrl: resolvedVideo } = useResolvedMediaUrl(videoUrl);
  const { resolvedUrl: resolvedMobileVideo } = useResolvedMediaUrl(mobileVideoUrl);
  const { resolvedUrl: resolvedPoster } = useResolvedMediaUrl(posterUrl);
  const { resolvedUrl: resolvedMobilePoster } = useResolvedMediaUrl(mobilePosterUrl);

  const [isMobileViewport, setIsMobileViewport] = useState(() =>
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia("(max-width: 734px)").matches
      : false
  );
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );
  const [imgError, setImgError] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const effectiveMode = resolveEffectiveMediaMode({
    mediaMode,
    desktopImage,
    mobileImage,
    videoUrl,
    mobileVideoUrl,
  });

  useEffect(() => {
    setImgError(false);
  }, [resolvedDesktop, resolvedMobile, resolvedPoster, resolvedMobilePoster, effectiveMode]);

  useEffect(() => {
    setVideoError(false);
  }, [resolvedVideo, resolvedMobileVideo, effectiveMode]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mobileQuery = window.matchMedia("(max-width: 734px)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    setIsMobileViewport(mobileQuery.matches);
    setPrefersReducedMotion(motionQuery.matches);

    const onMobileChange = (e: MediaQueryListEvent) => setIsMobileViewport(e.matches);
    const onMotionChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);

    mobileQuery.addEventListener?.("change", onMobileChange);
    motionQuery.addEventListener?.("change", onMotionChange);
    return () => {
      mobileQuery.removeEventListener?.("change", onMobileChange);
      motionQuery.removeEventListener?.("change", onMotionChange);
    };
  }, []);

  const videoPlayback = resolveResponsiveVideoPlayback({
    videoUrl: resolvedVideo,
    mobileVideoUrl: resolvedMobileVideo,
    posterUrl: resolvedPoster,
    mobilePosterUrl: resolvedMobilePoster,
    desktopImage: resolvedDesktop,
    mobileImage: resolvedMobile,
    videoAutoplay,
    videoMuted,
    videoLoop,
    isMobile: isMobileViewport,
    prefersReducedMotion,
  });

  const [videoPlaying, setVideoPlaying] = useState<boolean>(videoPlayback.shouldAutoplay);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    setVideoPlaying(videoPlayback.shouldAutoplay);
  }, [videoPlayback.shouldAutoplay, videoPlayback.activeVideoUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || effectiveMode !== "video" || !videoPlayback.activeVideoUrl || videoError) {
      return;
    }
    if (videoPlayback.shouldAutoplay) {
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {
          setVideoPlaying(false);
        });
      }
    } else {
      video.pause();
    }
  }, [
    effectiveMode,
    videoPlayback.activeVideoUrl,
    videoPlayback.shouldAutoplay,
    videoError,
  ]);

  const hasRenderableVideo =
    effectiveMode === "video" && Boolean(videoPlayback.activeVideoUrl) && !videoError;
  const fallbackPosterForBrokenVideo =
    effectiveMode === "video" &&
    (videoError || !videoPlayback.activeVideoUrl) &&
    Boolean(videoPlayback.activePosterUrl);
  const hasImage =
    (effectiveMode === "image" && Boolean((resolvedDesktop || resolvedMobile) && !imgError)) ||
    fallbackPosterForBrokenVideo;
  const isEmpty = !hasRenderableVideo && !hasImage;

  const objectPosition = FOCAL_POINT_MAP[focalPoint] || "center bottom";
  const imagePresentation = resolveHeroImagePresentationStyle({
    transform: imageTransform,
    isMobile: isMobileViewport,
    mediaFit: objectFit,
    mediaPosition: focalPoint,
  });

  const handleToggleVideo = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video
        .play()
        .then(() => setVideoPlaying(true))
        .catch(() => setVideoPlaying(false));
    } else {
      video.pause();
      setVideoPlaying(false);
    }
  };

  const displayImageSrc = fallbackPosterForBrokenVideo
    ? videoPlayback.activePosterUrl
    : resolvedDesktop || resolvedMobile;

  return (
    <div
      className={`apple-media-slot apple-media-slot--${variant} apple-media-slot--${tone} ${
        isEmpty ? "apple-media-slot--empty" : "apple-media-slot--populated"
      } ${className}`}
      style={backgroundColor ? { backgroundColor } : undefined}
      data-slot-empty={isEmpty ? "true" : "false"}
      data-slot-media-mode={effectiveMode}
    >
      {hasRenderableVideo ? (
        <div className="apple-media-slot__video-wrap">
          <video
            ref={videoRef}
            className="apple-media-slot__video"
            src={videoPlayback.activeVideoUrl}
            poster={videoPlayback.activePosterUrl || undefined}
            autoPlay={videoPlayback.shouldAutoplay}
            loop={videoPlayback.loop}
            muted={videoPlayback.muted}
            playsInline
            preload={priority ? "auto" : "metadata"}
            aria-label={imageAlt || slotLabel || "Promotional video"}
            onPlay={() => setVideoPlaying(true)}
            onPause={() => setVideoPlaying(false)}
            onError={() => setVideoError(true)}
            style={{
              objectFit,
              objectPosition,
            }}
          />
          <button
            type="button"
            className="apple-media-slot__video-toggle"
            onClick={handleToggleVideo}
            aria-label={videoPlaying ? "Pause background video" : "Play background video"}
            title={videoPlaying ? "Pause video" : "Play video"}
          >
            {videoPlaying ? <Pause size={14} /> : <Play size={14} />}
          </button>
        </div>
      ) : hasImage ? (
        <picture className="apple-media-slot__picture">
          {!fallbackPosterForBrokenVideo && resolvedMobile ? (
            <source media="(max-width: 734px)" srcSet={resolvedMobile} />
          ) : null}
          <img
            className="apple-media-slot__img"
            src={displayImageSrc}
            alt={imageAlt}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            decoding={priority ? "sync" : "async"}
            onError={() => setImgError(true)}
            data-hero-scale={String(imagePresentation.scale)}
            data-hero-offset-x={String(imagePresentation.offsetX)}
            data-hero-offset-y={String(imagePresentation.offsetY)}
            data-hero-viewport={isMobileViewport ? "mobile" : "desktop"}
            style={imagePresentation.style}
          />
        </picture>
      ) : (
        <div
          className="apple-media-slot__exhibition-frame"
          aria-hidden={!adminInteractive}
        >
          <div className="apple-media-slot__exhibition-glow" />
          <div className="apple-media-slot__exhibition-stage">
            <div className="apple-media-slot__exhibition-ring" />
            <span className="apple-media-slot__exhibition-line" />
          </div>
          {adminInteractive && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAdminSelectSlot?.();
              }}
              className="apple-media-slot__admin-empty-cta"
            >
              {effectiveMode === "video" ? <Video size={16} /> : <ImagePlus size={16} />}
              <span>
                {slotLabel
                  ? `Add ${effectiveMode === "video" ? "Video" : "Media"} · ${slotLabel}`
                  : "Add Image or Video"}
              </span>
            </button>
          )}
        </div>
      )}

      {!isEmpty && adminInteractive && onAdminSelectSlot && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAdminSelectSlot();
          }}
          className="apple-media-slot__admin-replace-pill"
          title="Replace or edit media in this slot"
        >
          {hasRenderableVideo ? <Video size={13} /> : <ImagePlus size={13} />}
          <span>Replace Media</span>
        </button>
      )}

      {caption ? (
        <div className="apple-media-slot__caption">{caption}</div>
      ) : null}
    </div>
  );
};
