import React, { useMemo, useState, useEffect } from "react";
import { SEO } from "../SEO";
import { useBuyJourney } from "../../context/BuyJourneyContext";
import { resolveConfiguredPrice, calculateTradeInBreakdown } from "../../utils/productPricing";
import { toAbsoluteProductImageUrl, whatsappUrl } from "../../utils/whatsapp";
import {
  BuyLayout,
  BuyOptionCard,
  BuyColorSwatches,
  BuyTradeInStep,
  BuySummaryCard,
  useBuyEntrySelection,
  type ColorOption,
} from "./BuyPrimitives";
import type { Product } from "../../types/product";

import { resolveColorOption } from "../../utils/productColors";
import { preloadProductImages } from "../../utils/productColorImages";
import { localCatalogueImageBySlug } from "../../utils/catalogueProductImages";

const ULTRA_FINISHES: ColorOption[] = [
  resolveColorOption("Natural Titanium"),
  resolveColorOption("Black Titanium"),
];

const ULTRA_FINISH_IMAGE_MAP: Record<string, string> = {
  "Natural Titanium": "/products/campaigns/watch-ultra-4-rugged.webp",
  "Black Titanium": "/products/campaigns/watch-ultra-4-hero.webp",
};

const ULTRA_BANDS = [
  { name: "Alpine Loop", desc: "Two textile layers woven into one continuous piece without stitching. Titanium G-hook ensures secure fit for outdoor adventure." },
  { name: "Trail Loop", desc: "Lightweight, thin and flexible fabric weave with convenient pull tab for rapid adjustments on runs and endurance training." },
  { name: "Ocean Band", desc: "Molded high-performance fluoroelastomer with tubular geometry stretches for a secure fit over a wetsuit for diving and water sports." },
];

const ULTRA_BAND_COLORS: ColorOption[] = [
  resolveColorOption("Safety Orange"),
  resolveColorOption("Dark Charcoal"),
  resolveColorOption("Ice Blue"),
];

export function WatchUltraBuyExperience({ catalogProduct }: { catalogProduct?: Product }) {
  const { addConfiguredItem, editingItem, customer } = useBuyJourney();
  const { color: entryColor } = useBuyEntrySelection();

  const [finish, setFinish] = useState("Natural Titanium");
  const [bandStyle, setBandStyle] = useState("Alpine Loop");
  const [bandColor, setBandColor] = useState("Safety Orange");
  const [bandDimension, setBandDimension] = useState<"Medium" | "Small" | "Large">("Medium");
  const [tradeIn, setTradeIn] = useState(false);
  const [activeThumb, setActiveThumb] = useState(0);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (entryColor && ULTRA_FINISHES.some((option) => option.name === entryColor)) setFinish(entryColor);
  }, [entryColor]);

  useEffect(() => {
    if (editingItem?.product.slug !== "apple-watch-ultra-4") return;
    const options = editingItem.options;
    if (options?.bandDimension === "Small" || options?.bandDimension === "Medium" || options?.bandDimension === "Large") setBandDimension(options.bandDimension);
    if (options?.finish) setFinish(options.finish);
    if (options?.bandStyle) setBandStyle(options.bandStyle);
    if (options?.bandColor) setBandColor(options.bandColor);
    setTradeIn(options?.tradeIn === "Yes");
  }, [editingItem]);

  const currentFinishImg = ULTRA_FINISH_IMAGE_MAP[finish] || ULTRA_FINISH_IMAGE_MAP["Natural Titanium"];

  // Preload Ultra finish images
  useEffect(() => {
    preloadProductImages([
      "/products/campaigns/watch-ultra-4-rugged.webp",
      "/products/campaigns/watch-ultra-4-orange.webp",
      "/products/campaigns/watch-ultra-4-hero.webp",
      localCatalogueImageBySlug["apple-watch-ultra-3"],
    ]);
  }, []);

  const thumbnails = useMemo(() => [
    { src: currentFinishImg, alt: `${finish} Apple Watch Ultra with Alpine Loop on white` },
    { src: "/products/campaigns/watch-ultra-4-orange.webp", alt: "Apple Watch Ultra high-contrast action display" },
    { src: "/products/campaigns/watch-ultra-4-hero.webp", alt: "Apple Watch Ultra dual perspective" },
  ], [currentFinishImg, finish]);

  const activeImage = thumbnails[activeThumb]?.src || currentFinishImg;

  const fallbackProduct: Product = useMemo(() => {
    const slug = "apple-watch-ultra-4";
    return {
      id: slug,
      slug,
      name: "Apple Watch Ultra 4",
      model: "Apple Watch Ultra 4",
      brand: "Apple",
      category: "Watches",
      condition: "Brand New",
      price: 14800,
      previousPrice: 15800,
      storage: ["49mm"],
      colors: ULTRA_FINISHES.map((f) => f.name),
      description: "Apple Watch Ultra 4 in 49mm aerospace-grade titanium with precision dual-frequency GPS and up to 72 hours of battery life.",
      specs: ["49mm Titanium Case", "3000 Nits Sapphire Display", "Action Button", "100m Water Resistance", "EN13319 Dive Certified"],
      box: ["Apple Watch Ultra 4", "Band", "Apple Watch Magnetic Fast Charger to USB-C Cable (1m)"],
      imageTone: "ink",
      images: thumbnails,
      variants: [
        { id: "awu4-49-cell", productId: slug, title: "49mm GPS + Cellular", screenSize: "49mm", connectivity: "GPS + Cellular", price: 14800, previousPrice: 15800, condition: "Brand New" as const, stockQuantity: 10, position: 1, available: true, isSale: true, stockStatus: "In Stock" as const },
      ],
      available: true,
      stockStatus: "In Stock" as const,
      stockQuantity: 10,
      featured: true,
    };
  }, [thumbnails]);

  const isExactMatch = Boolean(catalogProduct && (catalogProduct.slug === "apple-watch-ultra-4" || catalogProduct.name?.includes("4")));
  const activeProduct = isExactMatch && catalogProduct && catalogProduct.price > 0 && !catalogProduct.priceOnRequest ? catalogProduct : fallbackProduct;

  const configured = resolveConfiguredPrice(activeProduct, {
    screenSize: "49mm",
    connectivity: "GPS + Cellular",
  });
  const priceLabel = configured.formattedPrice;
  const previousPriceLabel = configured.formattedPreviousPrice;
  const tradeInBreakdown = calculateTradeInBreakdown(configured.price, tradeIn);

  const fullConfigurationTitle = `Apple Watch Ultra 4 (49mm, ${finish})`;

  const whatsAppEnquiry = whatsappUrl(
    `Hello Buy & Sell GH, I would like to order/enquire about ${fullConfigurationTitle}. Price: ${priceLabel}, Band: ${bandStyle} (${bandColor}, ${bandDimension}), Connectivity: GPS + Cellular (Standard), Fulfillment: ${customer.fulfilmentType === "pickup" ? "In-Store Pickup (Dome)" : "Doorstep Delivery"}${tradeIn ? ", Trade-in: Yes" : ""}. Product photo: ${toAbsoluteProductImageUrl(currentFinishImg)} Please confirm availability.`
  );

  const handleAddToBag = () => {
    const added = addConfiguredItem(
      activeProduct,
      "49mm GPS + Cellular",
      `${finish} / ${bandStyle} (${bandColor}, ${bandDimension})`,
      configured.variant ? { ...configured.variant, title: `Apple Watch Ultra 4 (49mm ${finish})` } : undefined,
      currentFinishImg,
      { caseSize: "49mm", connectivity: "GPS + Cellular", finish, bandStyle, bandColor, bandDimension, tradeIn: tradeIn ? "Yes" : "No" },
    );
    if (added) {
      setNotice(`${fullConfigurationTitle} (${priceLabel}) added to your bag.`);
    }
  };

  return (
    <BuyLayout
      name="Apple Watch Ultra 4"
      categoryLabel="Watch"
      categoryPath="/watch"
      activeImageSrc={activeImage}
      activeImageAlt="Apple Watch Ultra 4 in rugged titanium"
      priceLabel={priceLabel}
      badge="Ultra"
      darkStage={true}
      thumbnails={thumbnails}
      activeThumbnailIndex={activeThumb}
      onSelectThumbnail={setActiveThumb}
      mobileActionLabel="Add to Bag"
      onMobileAction={handleAddToBag}
    >
      <SEO
        title="Buy Apple Watch Ultra 4 | Buy & Sell GH"
        description="Configure your Apple Watch Ultra 4 in Accra, Ghana. 49mm aerospace-grade titanium, GPS + Cellular, Alpine, Trail and Ocean bands with Buy & Sell GH."
      />

      <div className="apple-buy-intro">
        <p className="apple-buy-intro-eyebrow">Apple Watch Ultra 4</p>
        <h2 className="apple-buy-intro-title">Buy Apple Watch Ultra 4</h2>
        <p className="apple-buy-intro-lede">
          49mm aerospace-grade titanium case, precision dual-frequency GPS, 100m water resistance, and up to 72 hours of battery life in Low Power Mode.
        </p>
      </div>

      {/* Step 1: Titanium Finish */}
      <section className="apple-buy-step">
        <div className="apple-buy-step-header">
          <h3 className="apple-buy-step-title">Finish. <span>Aerospace-grade titanium.</span></h3>
          <p className="apple-buy-step-subtitle">High-durability titanium enclosure with raised bezel protecting the sapphire crystal.</p>
        </div>
        <BuyColorSwatches
          colors={ULTRA_FINISHES}
          selectedColor={finish}
          previewImageSrc={currentFinishImg}
          previewImageAlt={`Apple Watch Ultra in ${finish}`}
          onSelect={(c) => {
            setFinish(c);
            setActiveThumb(0);
          }}
        />
      </section>

      {/* Step 2: Connectivity Display */}
      <section className="apple-buy-step">
        <div className="apple-buy-step-header">
          <h3 className="apple-buy-step-title">Connectivity. <span>Built-in standard.</span></h3>
          <p className="apple-buy-step-subtitle">Every Apple Watch Ultra comes equipped with cellular connectivity.</p>
        </div>
        <div className="apple-buy-cards-grid apple-buy-cards-grid-single">
          <BuyOptionCard
            title="GPS + Cellular (Standard)"
            subtitle="Standalone cellular freedom with dual-frequency GPS and international roaming support."
            selected={true}
            onClick={() => {}}
          />
        </div>
      </section>

      {/* Step 3: Ultra Band Style */}
      <section className="apple-buy-step">
        <div className="apple-buy-step-header">
          <h3 className="apple-buy-step-title">Band. <span>Engineered for extremes.</span></h3>
          <p className="apple-buy-step-subtitle">Specialized bands tailored for outdoor endurance, exploration, and deep-water diving.</p>
        </div>
        <div className="apple-buy-cards-grid apple-buy-cards-grid-single">
          {ULTRA_BANDS.map((b) => (
            <BuyOptionCard
              key={b.name}
              title={b.name}
              subtitle={b.desc}
              selected={bandStyle === b.name}
              onClick={() => setBandStyle(b.name)}
            />
          ))}
        </div>
      </section>

      {/* Step 4: Band Color & Size */}
      <section className="apple-buy-step">
        <div className="apple-buy-step-header">
          <h3 className="apple-buy-step-title">Band Color &amp; Wrist Size.</h3>
          <p className="apple-buy-step-subtitle">Select colorway and strap length.</p>
        </div>
        <BuyColorSwatches
          colors={ULTRA_BAND_COLORS}
          selectedColor={bandColor}
          onSelect={setBandColor}
        />
        <div className="apple-buy-cards-grid" style={{ marginTop: "12px" }}>
          <BuyOptionCard
            title="Small"
            subtitle="Fits 130–160mm wrists"
            selected={bandDimension === "Small"}
            onClick={() => setBandDimension("Small")}
          />
          <BuyOptionCard
            title="Medium"
            subtitle="Fits 145–190mm wrists"
            selected={bandDimension === "Medium"}
            onClick={() => setBandDimension("Medium")}
          />
          <BuyOptionCard
            title="Large"
            subtitle="Fits 165–210mm wrists"
            selected={bandDimension === "Large"}
            onClick={() => setBandDimension("Large")}
          />
        </div>
      </section>

      {/* Step 5: Trade-in */}
      <BuyTradeInStep tradeInSelected={tradeIn} onSelect={setTradeIn} />

      {/* Step 8: Order Summary & Bag Action */}
      <BuySummaryCard
        title="Your Apple Watch Ultra 4"
        items={[
          { label: "Model", value: "Apple Watch Ultra 4" },
          { label: "Case", value: `49mm Titanium (${finish})` },
          { label: "Connectivity", value: "GPS + Cellular (Standard)" },
          { label: "Band", value: `${bandStyle} (${bandColor}, ${bandDimension})` },
          { label: "Trade-in", value: tradeIn ? "Device trade-in requested" : "No trade-in" },
        ]}
        priceLabel={priceLabel}
        previousPriceLabel={previousPriceLabel}
        tradeInBreakdown={tradeInBreakdown}
        onAddToBag={handleAddToBag}
        addToBagLabel="Add to Bag"
        whatsAppHref={whatsAppEnquiry}
        notice={notice}
      />
    </BuyLayout>
  );
}
