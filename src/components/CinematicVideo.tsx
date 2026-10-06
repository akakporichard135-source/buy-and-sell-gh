import { useEffect, useRef, useState } from "react";

export interface CinematicVideoProps {
  src?: string;
  mobileSrc?: string;
  poster: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
  autoPlayThreshold?: number;
  priority?: boolean;
  isClean?: boolean;
  isDesktopClean?: boolean;
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
  isDesktopClean = true,
}: CinematicVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  // Check for prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Check viewport for responsive video gating
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 640px)");
    setIsMobileViewport(mql.matches);

    const handler = (e: MediaQueryListEvent) => setIsMobileViewport(mql.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  // Ensure video element has muted property explicitly set and plays smoothly
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    videoEl.muted = true;
    videoEl.defaultMuted = true;
    videoEl.play().then(() => setIsPlaying(true)).catch(() => {
      // autoplay may be deferred until interaction or intersection
    });
  }, [src, mobileSrc, isMobileViewport]);

  // IntersectionObserver to only play when video is visible in the viewport
  useEffect(() => {
    if (!isClean || prefersReducedMotion || hasError) return;

    const videoEl = videoRef.current;
    const containerEl = containerRef.current;
    if (!videoEl || !containerEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
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
        videoEl.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [autoPlayThreshold, prefersReducedMotion, hasError, isClean]);

  const hasDesktopVideo = Boolean(isClean && isDesktopClean && src);
  const hasMobileVideo = Boolean(isClean && mobileSrc);

  // Clean static hero presentation when clean footage is not available or reduced-motion is requested
  if (!isClean || prefersReducedMotion || hasError || (!hasDesktopVideo && !hasMobileVideo)) {
    return (
      <div
        ref={containerRef}
        className={`cinematic-video-container cinematic-clean-fallback ${className}`}
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

  // When clean mobile video exists but desktop clean video does not yet exist
  if (!hasDesktopVideo && hasMobileVideo) {
    return (
      <div
        ref={containerRef}
        className={`cinematic-video-container ${className} relative overflow-hidden`}
        style={aspectRatio ? { aspectRatio } : undefined}
      >
        {/* Desktop Presentation (>= 641px): Clean approved product visual */}
        <div className="cinematic-clean-fallback hidden sm:flex absolute inset-0 w-full h-full items-center justify-center">
          <img
            src={poster}
            alt={alt}
            className="cinematic-video-media cinematic-video-poster"
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            decoding="async"
          />
        </div>

        {/* Mobile Presentation (<= 640px): Verified clean WebM cinematic footage */}
        <div className="block sm:hidden absolute inset-0 w-full h-full">
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
          {isMobileViewport && (
            <video
              ref={videoRef}
              className={`cinematic-video-media transition-opacity duration-700 ease-out ${
                isLoaded ? "opacity-100" : "opacity-0"
              }`}
              autoPlay
              muted
              playsInline
              loop
              preload={priority ? "auto" : "metadata"}
              poster={poster}
              onLoadedData={() => {
                setIsLoaded(true);
                videoRef.current?.play().then(() => setIsPlaying(true)).catch(() => {});
              }}
              onCanPlay={() => {
                setIsLoaded(true);
                videoRef.current?.play().then(() => setIsPlaying(true)).catch(() => {});
              }}
              onError={() => setHasError(true)}
            >
              <source src={mobileSrc} type="video/webm" />
            </video>
          )}
        </div>
      </div>
    );
  }

  // Full clean video presentation for both desktop and mobile
  return (
    <div
      ref={containerRef}
      className={`cinematic-video-container ${className} relative overflow-hidden`}
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
        loop
        preload={priority ? "auto" : "metadata"}
        poster={poster}
        onLoadedData={() => {
          setIsLoaded(true);
          videoRef.current?.play().then(() => setIsPlaying(true)).catch(() => {});
        }}
        onCanPlay={() => {
          setIsLoaded(true);
          videoRef.current?.play().then(() => setIsPlaying(true)).catch(() => {});
        }}
        onError={() => setHasError(true)}
      >
        {mobileSrc && (
          <source src={mobileSrc} type="video/webm" media="(max-width: 640px)" />
        )}
        {src && <source src={src} type="video/mp4" />}
      </video>
    </div>
  );
}
