import assert from "node:assert/strict";
import { mkdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";

export async function testHeroImageTransform(projectRoot, bundle, outdir) {
  const transformMod = await bundle(
    path.join(projectRoot, "src/cms/heroImageTransform.ts"),
    path.join(outdir, "heroImageTransform.mjs")
  );
  const builderUtils = await bundle(
    path.join(projectRoot, "src/cms/homepageBuilderUtils.ts"),
    path.join(outdir, "homepageBuilderUtilsHeroTransform.mjs")
  );
  const cmsRepo = await bundle(
    path.join(projectRoot, "src/cms/supabaseCmsRepository.ts"),
    path.join(outdir, "supabaseCmsRepositoryHeroTransform.mjs")
  );

  // 1. Default normalization & safe clamping
  const defaults = transformMod.normalizeHeroImageTransform(undefined);
  assert.deepEqual(defaults, {
    desktopScale: 100,
    desktopOffsetX: 0,
    desktopOffsetY: 0,
    mobileScale: 100,
    mobileOffsetX: 0,
    mobileOffsetY: 0,
  });

  const clamped = transformMod.normalizeHeroImageTransform({
    desktopScale: 999,
    desktopOffsetX: -120,
    desktopOffsetY: 88,
    mobileScale: 10,
    mobileOffsetX: Number.NaN,
    mobileOffsetY: -90,
  });
  assert.deepEqual(clamped, {
    desktopScale: 160,
    desktopOffsetX: -45,
    desktopOffsetY: 45,
    mobileScale: 50,
    mobileOffsetX: 0,
    mobileOffsetY: -45,
  });

  // 2. Storage sanitizer keeps untouched heroes clean (`undefined`) and retains custom transforms
  assert.equal(transformMod.sanitizeHeroImageTransformForStorage(defaults), undefined);
  assert.deepEqual(
    transformMod.sanitizeHeroImageTransformForStorage({ desktopScale: 120, mobileOffsetY: -10 }),
    {
      desktopScale: 120,
      desktopOffsetX: 0,
      desktopOffsetY: 0,
      mobileScale: 100,
      mobileOffsetX: 0,
      mobileOffsetY: -10,
    }
  );

  // 3. Untouched hero produces zero CSS transform (zero regression on existing campaigns)
  const untouchedDesktop = transformMod.resolveHeroImagePresentationStyle({
    transform: undefined,
    isMobile: false,
    mediaFit: "contain",
    mediaPosition: "bottom",
    mixBlendMode: "normal",
  });
  assert.equal(untouchedDesktop.isCustomized, false);
  assert.equal(untouchedDesktop.style.transform, undefined);
  assert.equal(untouchedDesktop.style.objectFit, "contain");
  assert.equal(untouchedDesktop.style.objectPosition, "center bottom");

  // 4. Independent Desktop vs Mobile scale + horizontal & vertical positioning in contain mode
  const custom = {
    desktopScale: 125,
    desktopOffsetX: 14,
    desktopOffsetY: -8,
    mobileScale: 90,
    mobileOffsetX: -12,
    mobileOffsetY: 10,
  };
  const deskStyle = transformMod.resolveHeroImagePresentationStyle({
    transform: custom,
    isMobile: false,
    mediaFit: "contain",
    mediaPosition: "bottom",
    mixBlendMode: "normal",
  });
  const mobStyle = transformMod.resolveHeroImagePresentationStyle({
    transform: custom,
    isMobile: true,
    mediaFit: "contain",
    mediaPosition: "bottom",
    mixBlendMode: "normal",
  });

  assert.equal(deskStyle.isCustomized, true);
  assert.equal(deskStyle.style.objectFit, "contain", "Aspect ratio locked via object-fit: contain");
  assert.equal(deskStyle.style.transform, "translate3d(14%, -8%, 0) scale(1.25)");
  assert.equal(deskStyle.style.transformOrigin, "center bottom", "Anchored to bottom to avoid unwanted bottom cropping");
  assert.doesNotMatch(String(deskStyle.style.transform), /scaleX|scaleY/, "Never stretches X/Y independently");

  assert.equal(mobStyle.isCustomized, true);
  assert.equal(mobStyle.style.objectFit, "contain");
  assert.equal(mobStyle.style.transform, "translate3d(-12%, 10%, 0) scale(0.9)");
  assert.equal(mobStyle.style.transformOrigin, "center bottom");

  // 5. Cover mode uses focal object-position panning + uniform focal zoom (no bare edges when panned)
  const coverStyle = transformMod.resolveHeroImagePresentationStyle({
    transform: { desktopScale: 115, desktopOffsetX: -20, desktopOffsetY: 15 },
    isMobile: false,
    mediaFit: "cover",
    mediaPosition: "center",
  });
  assert.equal(coverStyle.style.objectFit, "cover");
  assert.equal(coverStyle.style.objectPosition, "30% 65%");
  assert.equal(coverStyle.style.transform, "scale(1.15)");
  assert.equal(coverStyle.style.transformOrigin, "30% 65%");

  // 6. Reset Desktop, Reset Mobile, Reset All, and Copy Desktop -> Mobile
  const resetDesk = transformMod.resetHeroImageTransformViewport(custom, "desktop");
  assert.equal(resetDesk.desktopScale, 100);
  assert.equal(resetDesk.desktopOffsetX, 0);
  assert.equal(resetDesk.desktopOffsetY, 0);
  assert.equal(resetDesk.mobileScale, 90, "Reset Desktop preserves Mobile framing");
  assert.equal(resetDesk.mobileOffsetX, -12);

  const resetMob = transformMod.resetHeroImageTransformViewport(custom, "mobile");
  assert.equal(resetMob.mobileScale, 100);
  assert.equal(resetMob.desktopScale, 125, "Reset Mobile preserves Desktop framing");

  assert.equal(transformMod.resetHeroImageTransformViewport(custom, "all"), undefined);

  const copied = transformMod.copyDesktopToMobileHeroTransform(custom);
  assert.equal(copied.mobileScale, 125);
  assert.equal(copied.mobileOffsetX, 14);
  assert.equal(copied.mobileOffsetY, -8);

  // 7. Persistence round-trip through normalizeHomepageContent + atomic campaign swap
  const normalizedHome = cmsRepo.normalizeHomepageContent({
    layoutMode: "legacy",
    heroes: [
      {
        id: "iphone-18-pro",
        title: "iPhone",
        subtitle: "Say hello to the latest generation of iPhone.",
        image: "/products/homepage/iphone-18-pro-hero-2x.webp",
        alt: "iPhone",
        tone: "dark",
        backgroundColor: "#000000",
        mediaFit: "contain",
        mediaPosition: "bottom",
        imageTransform: custom,
        primary: { label: "Learn more", to: "/iphone/iphone-18-pro" },
        enabled: true,
        order: 1,
      },
      {
        id: "watch-series-12",
        title: "Apple Watch Series 12",
        subtitle: "Smarter health.",
        image: "/products/homepage/watch-series-12.jpg",
        alt: "Watch",
        tone: "dark",
        backgroundColor: "#000000",
        mediaFit: "contain",
        mediaPosition: "bottom",
        primary: { label: "Learn more", to: "/watch/apple-watch-series-12" },
        enabled: true,
        order: 2,
      },
    ],
  });

  assert.deepEqual(
    normalizedHome.heroes[0].imageTransform,
    custom,
    "normalizeHomepageContent preserves hero imageTransform cleanly for Supabase persistence"
  );
  assert.equal(
    normalizedHome.heroes[1].imageTransform,
    undefined,
    "Untouched hero remains undefined without inventing extra properties"
  );

  const swapped = builderUtils.swapLegacyMediaUnits(
    normalizedHome,
    { kind: "hero", index: 0 },
    { kind: "hero", index: 1 }
  );
  assert.deepEqual(
    swapped.heroes[1].imageTransform,
    custom,
    "Swapping hero campaigns preserves imageTransform atomically"
  );
  assert.equal(swapped.heroes[0].imageTransform, undefined);

  // 8. Source wiring verification (Admin controls, live previews at 1440/430/390, Reset, HomePage)
  const adminMgrSrc = await readFile(
    path.join(projectRoot, "src/pages/admin/AdminHomepageManager.tsx"),
    "utf8"
  );
  const previewPageSrc = await readFile(
    path.join(projectRoot, "src/pages/admin/AdminHomepagePreviewPage.tsx"),
    "utf8"
  );
  const homePageSrc = await readFile(path.join(projectRoot, "src/pages/HomePage.tsx"), "utf8");
  const controlsSrc = await readFile(
    path.join(projectRoot, "src/components/admin/HeroImageTransformControls.tsx"),
    "utf8"
  );

  assert.match(adminMgrSrc, /HeroImageTransformControls/, "AdminHomepageManager renders HeroImageTransformControls");
  assert.match(adminMgrSrc, /Mobile 430px/, "Admin preview modal includes 430px viewport");
  assert.match(previewPageSrc, /430px/, "AdminHomepagePreviewPage includes 430px viewport");
  assert.match(homePageSrc, /resolveHeroImagePresentationStyle/, "HomePage applies hero image transform style");
  assert.match(controlsSrc, /hero-reset-all-/, "HeroImageTransformControls provides Reset All control");
  assert.match(controlsSrc, /hero-live-preview-desktop-/, "HeroImageTransformControls provides Desktop live preview");
  assert.match(controlsSrc, /hero-live-preview-mobile-/, "HeroImageTransformControls provides Mobile live preview");

  console.log("Hero Image Scale & Position regression tests passed!");
}

const isDirectRun =
  process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;

if (isDirectRun) {
  const projectRoot = process.cwd();
  const outdir = path.join(tmpdir(), `buyandsell-hero-transform-test-${Date.now()}`);
  await mkdir(outdir, { recursive: true });
  const bundle = async (entry, outfile, platform = "node") => {
    await build({
      bundle: true,
      entryPoints: [entry],
      define: {
        "import.meta.env": "{}",
        "import.meta.env.DEV": "true",
        "import.meta.env.PROD": "false",
        "import.meta.env.VITE_SUPABASE_ANON_KEY": '""',
        "import.meta.env.VITE_SUPABASE_PRODUCT_IMAGES_BUCKET": '"product-images"',
        "import.meta.env.VITE_SUPABASE_URL": '""',
      },
      format: "esm",
      loader: { ".webp": "file", ".png": "file", ".jpg": "file", ".jpeg": "file", ".svg": "file" },
      outfile,
      platform,
    });
    return import(pathToFileURL(outfile).href);
  };
  try {
    await testHeroImageTransform(projectRoot, bundle, outdir);
  } finally {
    await rm(outdir, { recursive: true, force: true });
  }
}
