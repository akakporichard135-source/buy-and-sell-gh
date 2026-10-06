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
}: CinematicVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Check for prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

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
      { threshold: autoPlayThreshold }
    );

    observer.observe(containerEl);

    // Visibility change handler (pauses video when browser tab is inactive)
    const handleVisibility = () => {
      if (document.hidden) {
        videoEl.pause();
        setIsPlaying(false);
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
        muted
        playsInline
        loop
        preload={priority ? "auto" : "metadata"}
        poster={poster}
        onLoadedData={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
      >
        {mobileSrc && (
          <source src={mobileSrc} type="video/webm" media="(max-width: 640px)" />
        )}
        <source src={src} type="video/mp4" />
      </video>
    </div>
  );
}
