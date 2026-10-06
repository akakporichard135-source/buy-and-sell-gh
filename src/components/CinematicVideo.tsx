import { Pause, Play } from "lucide-react";
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
}: CinematicVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isUserPaused, setIsUserPaused] = useState(false);
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
    if (prefersReducedMotion || hasError) return;

    const videoEl = videoRef.current;
    const containerEl = containerRef.current;
    if (!videoEl || !containerEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isUserPaused) {
          videoEl.play().then(() => setIsPlaying(true)).catch(() => {
            // Autoplay policy fallback
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
      } else if (!isUserPaused && observer) {
        // re-check if intersecting
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [autoPlayThreshold, isUserPaused, prefersReducedMotion, hasError]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
      setIsUserPaused(true);
    } else {
      video.play().then(() => {
        setIsPlaying(true);
        setIsUserPaused(false);
      }).catch(() => {});
    }
  };

  if (prefersReducedMotion || hasError) {
    return (
      <div
        ref={containerRef}
        className={`cinematic-video-container ${className}`}
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
      className={`cinematic-video-container ${className} relative overflow-hidden group`}
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

      {/* Discreet floating playback control for accessibility */}
      {isLoaded && (
        <button
          type="button"
          onClick={togglePlayPause}
          className="cinematic-video-toggle absolute bottom-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white/80 backdrop-blur-md transition hover:bg-black/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-gold/60"
          aria-label={isPlaying ? "Pause cinematic background video" : "Play cinematic background video"}
          title={isPlaying ? "Pause video" : "Play video"}
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
        </button>
      )}
    </div>
  );
}
