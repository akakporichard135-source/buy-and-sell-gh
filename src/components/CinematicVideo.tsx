import { useEffect, useRef, useState } from "react";

export interface CinematicVideoProps {
  src: string;
  mobileSrc?: string;
  poster: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
  autoPlayThreshold?: number;
  priority?: boolean;
  isClean?: boolean;
  fit?: "contain" | "cover";
  loopStart?: number;
  loopEnd?: number;
  playbackRate?: number;
  mobileLoopStart?: number;
  mobileLoopEnd?: number;
  mobilePlaybackRate?: number;
}

export function CinematicVideo({
  src,
  mobileSrc,
  poster,
  alt,
  className = "",
  aspectRatio,
  autoPlayThreshold = 0.25,
  priority = false,
  isClean = true,
  fit = "cover",
  loopStart,
  loopEnd,
  playbackRate,
  mobileLoopStart,
  mobileLoopEnd,
  mobilePlaybackRate,
}: CinematicVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const [hasError, setHasError] = useState(false);

  const hasLoopRange = loopStart !== undefined && loopEnd !== undefined;

  const getTiming = () => {
    const videoEl = videoRef.current;
    const isMobile = Boolean(
      videoEl && (
        (mobileSrc && videoEl.currentSrc.includes(mobileSrc)) ||
        (typeof window !== "undefined" && window.innerWidth <= 640 && mobileSrc)
      )
    );
    if (isMobile && mobileLoopEnd !== undefined) {
      return {
        start: mobileLoopStart ?? 0,
        end: mobileLoopEnd,
        rate: mobilePlaybackRate ?? 1,
      };
    }
    return {
      start: loopStart ?? 0,
      end: loopEnd ?? (videoEl?.duration || 10),
      rate: playbackRate ?? 1,
    };
  };

  // Check for prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Ensure video element has muted property explicitly set, starts at correct loop point & rate, and plays smoothly
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    videoEl.muted = true;
    videoEl.defaultMuted = true;
    const { start, rate } = getTiming();
    if (hasLoopRange) {
      videoEl.currentTime = start;
    }
    videoEl.playbackRate = rate;
    videoEl.play().then(() => setIsPlaying(true)).catch(() => {
      // autoplay may be deferred until interaction or intersection
    });
  }, [src, hasLoopRange]);

  // Range-based loop controller and playback rate maintenance
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl || !hasLoopRange) return;

    let rafId: number;

    const applyTiming = () => {
      const { rate } = getTiming();
      if (videoEl.playbackRate !== rate) {
        videoEl.playbackRate = rate;
      }
    };

    const monitorLoop = () => {
      if (!videoEl.paused && !videoEl.ended) {
        const { start, end } = getTiming();
        if (videoEl.currentTime >= end) {
          videoEl.currentTime = start;
        } else if (videoEl.currentTime < start - 0.05) {
          videoEl.currentTime = start;
        }
      }
      rafId = requestAnimationFrame(monitorLoop);
    };

    const handleLoadedMetadata = () => {
      const { start, rate } = getTiming();
      videoEl.currentTime = start;
      videoEl.playbackRate = rate;
    };

    videoEl.addEventListener("loadedmetadata", handleLoadedMetadata);
    videoEl.addEventListener("play", applyTiming);
    rafId = requestAnimationFrame(monitorLoop);

    return () => {
      cancelAnimationFrame(rafId);
      videoEl.removeEventListener("loadedmetadata", handleLoadedMetadata);
      videoEl.removeEventListener("play", applyTiming);
    };
  }, [hasLoopRange, loopStart, loopEnd, playbackRate, mobileLoopStart, mobileLoopEnd, mobilePlaybackRate, mobileSrc, src]);

  // IntersectionObserver to only play when video is visible in the viewport
  useEffect(() => {
    if (!isClean || prefersReducedMotion || hasError) return;

    const videoEl = videoRef.current;
    const containerEl = containerRef.current;
    if (!videoEl || !containerEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const { rate } = getTiming();
          videoEl.playbackRate = rate;
          videoEl.play().then(() => setIsPlaying(true)).catch(() => {
            setIsPlaying(false);
          });
        } else {
          videoEl.pause();
          setIsPlaying(false);
        }
      },
      { threshold: Math.min(autoPlayThreshold, 0.1) }
    );

    observer.observe(containerEl);

    // Visibility change handler (pauses video when browser tab is inactive)
    const handleVisibility = () => {
      if (document.hidden) {
        videoEl.pause();
        setIsPlaying(false);
      } else {
        const { rate } = getTiming();
        videoEl.playbackRate = rate;
        videoEl.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [autoPlayThreshold, prefersReducedMotion, hasError, isClean]);

  // Clean static hero presentation when clean footage is not available or reduced-motion is requested
  if (!isClean || prefersReducedMotion || hasError) {
    return (
      <div
        ref={containerRef}
        className={`cinematic-video-container cinematic-clean-fallback cinematic-video-fit-${fit} ${className}`}
        style={aspectRatio ? { aspectRatio } : undefined}
      >
        <img
          src={poster}
          alt={alt}
          className="cinematic-video-media cinematic-video-poster"
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
        />
      </div>
    );
  }

  const srcType = src.endsWith(".webm") ? "video/webm" : "video/mp4";
  const mobileType = mobileSrc?.endsWith(".webm") ? "video/webm" : "video/mp4";

  return (
    <div
      ref={containerRef}
      className={`cinematic-video-container cinematic-video-fit-${fit} ${className} relative overflow-hidden`}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {/* High-res poster until video loads */}
      <img
        src={poster}
        alt={alt}
        className={`cinematic-video-poster transition-opacity duration-700 ease-out ${
          isLoaded ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
      />

      <video
        ref={videoRef}
        className={`cinematic-video-media transition-opacity duration-700 ease-out ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        autoPlay
        muted
        playsInline
        loop={!hasLoopRange}
        preload={priority ? "auto" : "metadata"}
        poster={poster}
        onLoadedData={() => {
          setIsLoaded(true);
          const videoEl = videoRef.current;
          if (videoEl) {
            const { start, rate } = getTiming();
            if (hasLoopRange) {
              videoEl.currentTime = start;
            }
            videoEl.playbackRate = rate;
            videoEl.play().then(() => setIsPlaying(true)).catch(() => {});
          }
        }}
        onCanPlay={() => {
          setIsLoaded(true);
          const videoEl = videoRef.current;
          if (videoEl) {
            const { rate } = getTiming();
            videoEl.playbackRate = rate;
            videoEl.play().then(() => setIsPlaying(true)).catch(() => {});
          }
        }}
        onError={() => setHasError(true)}
      >
        {mobileSrc && (
          <source src={mobileSrc} type={mobileType} media="(max-width: 640px)" />
        )}
        <source src={src} type={srcType} />
      </video>
    </div>
  );
}
