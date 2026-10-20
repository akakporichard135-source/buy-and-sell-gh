import { useEffect, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin safely once
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface CinematicAnimationOptions {
  enabled?: boolean;
  enableParallax?: boolean;
  enableCardStagger?: boolean;
}

/**
 * Custom React hook for cinematic, Apple-inspired scroll-linked storytelling
 * utilizing GSAP and ScrollTrigger.
 *
 * Designed with strict respect for:
 * - prefers-reduced-motion (skips all animation)
 * - Zero scroll hijacking (leaves native browser scrolling completely untouched)
 * - Strict lifecycle cleanup via gsap.context (0 memory leaks)
 */
export function useCinematicScrollAnimation(
  scopeRef: RefObject<HTMLElement | null>,
  options: CinematicAnimationOptions = {}
) {
  const { enabled = true, enableParallax = true, enableCardStagger = true } = options;

  useEffect(() => {
    if (!enabled || typeof window === "undefined" || !scopeRef.current) {
      return;
    }

    // Check user's OS preference for reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      // In reduced motion mode, ensure all content is immediately fully visible
      const elements = scopeRef.current.querySelectorAll(
        ".editorial-hero-copy > *, .editorial-hero-art img, .editorial-chapter, .editorial-info-card, .learn-more-extra-section, .learn-more-feature-card"
      );
      elements.forEach((el) => {
        (el as HTMLElement).style.opacity = "1";
        (el as HTMLElement).style.transform = "none";
      });
      return;
    }

    const container = scopeRef.current;

    // Use gsap.context for bulletproof React 19 scoped cleanup
    const ctx = gsap.context(() => {
      // 1. Hero Reveal Animation (runs on initial mount)
      const heroCopyItems = container.querySelectorAll(
        ".editorial-hero-copy > *, .story-hero-copy > *"
      );
      if (heroCopyItems.length > 0) {
        gsap.fromTo(
          heroCopyItems,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.75,
            ease: "power2.out",
            stagger: 0.1,
            delay: 0.1,
          }
        );
      }

      const heroArt = container.querySelector(
        ".editorial-hero-art img, .story-hero .experience-media img"
      );
      if (heroArt) {
        gsap.fromTo(
          heroArt,
          { opacity: 0, scale: 0.95, y: 16 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.95,
            ease: "power2.out",
            delay: 0.25,
          }
        );
      }

      // 2. Scroll-Linked Chapter & Section Reveals
      const scrollSections = container.querySelectorAll<HTMLElement>(
        ".editorial-chapter, .editorial-hardware-anchor, .editorial-information, .learn-more-extra-section"
      );

      scrollSections.forEach((section) => {
        // Find copy inside the section to reveal
        const copyElements = section.querySelectorAll(
          ".editorial-chapter-copy > *, .editorial-info-header > *, .learn-more-extra-copy > *"
        );

        if (copyElements.length > 0) {
          gsap.fromTo(
            copyElements,
            { opacity: 0, y: 28 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: "power2.out",
              stagger: 0.08,
              scrollTrigger: {
                trigger: section,
                start: "top 85%",
                toggleActions: "play none none none",
                once: true,
              },
            }
          );
        }

        // Section visual entrance
        const sectionArt = section.querySelector(
          ".editorial-chapter-art img, .learn-more-extra-image img, .learn-more-extra-gallery"
        );
        if (sectionArt) {
          gsap.fromTo(
            sectionArt,
            { opacity: 0, y: 32 },
            {
              opacity: 1,
              y: 0,
              duration: 0.9,
              ease: "power2.out",
              scrollTrigger: {
                trigger: section,
                start: "top 82%",
                toggleActions: "play none none none",
                once: true,
              },
            }
          );
        }
      });

      // 3. Staggered Feature Cards Grid
      if (enableCardStagger) {
        const cardGrids = container.querySelectorAll<HTMLElement>(
          ".editorial-info-grid, .learn-more-extra-cards-grid, .learn-more-extra-comparison-grid"
        );

        cardGrids.forEach((grid) => {
          const cards = grid.children;
          if (cards.length > 0) {
            gsap.fromTo(
              cards,
              { opacity: 0, y: 30 },
              {
                opacity: 1,
                y: 0,
                duration: 0.75,
                ease: "power2.out",
                stagger: 0.12,
                scrollTrigger: {
                  trigger: grid,
                  start: "top 85%",
                  toggleActions: "play none none none",
                  once: true,
                },
              }
            );
          }
        });
      }

      // 4. Subtle Hardware Close-up Parallax (Non-intrusive)
      if (enableParallax) {
        const parallaxImages = container.querySelectorAll<HTMLElement>(
          ".editorial-hardware-anchor-art img, .learn-more-extra-image.is-hardware-closeup img"
        );

        parallaxImages.forEach((img) => {
          gsap.fromTo(
            img,
            { y: -18 },
            {
              y: 18,
              ease: "none",
              scrollTrigger: {
                trigger: img,
                start: "top bottom",
                end: "bottom top",
                scrub: 1.2,
              },
            }
          );
        });
      }

      // 5. Highlights Rail Entry
      const highlightsRail = container.querySelector(".editorial-highlight-rail, .story-highlight-rail");
      if (highlightsRail) {
        gsap.fromTo(
          highlightsRail,
          { opacity: 0, x: 20 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: highlightsRail,
              start: "top 85%",
              toggleActions: "play none none none",
              once: true,
            },
          }
        );
      }
    }, container);

    // Refresh triggers after assets have had time to layout
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 250);

    return () => {
      clearTimeout(timer);
      ctx.revert(); // Automatically kills and cleans up all animations & ScrollTriggers in the scope
    };
  }, [scopeRef, enabled, enableParallax, enableCardStagger]);
}
