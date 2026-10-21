"""Inventory the supplied Learn More images and make numbered review sheets."""

import csv
from pathlib import Path

from PIL import Image, ImageDraw, ImageOps


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "incoming-assets" / "learn-more-20261021"
OUTPUT = ROOT / "docs" / "learn-more-audit"
OUTPUT.mkdir(parents=True, exist_ok=True)

images = sorted(SOURCE.glob("*.jpeg"))

# The source filenames are timestamps; these decisions come from visual review
# of every numbered image on the contact sheets, not from filename order.
GROUPS = [
    (range(1, 3), "mac-mini", "Ports and desk setup"),
    (range(3, 4), "macbook-pro", "Chip comparison; exact model uncertain"),
    (range(4, 5), "ipad-air", "Magic Keyboard"),
    (range(5, 6), "mac-mini", "Compact design and ports"),
    (range(6, 18), "ipad-air", "Display, colors, apps, keyboard and hero"),
    (range(18, 20), "macbook-air", "Ports and connectivity"),
    (range(20, 21), "ipad-air", "iPadOS apps"),
    (range(21, 29), "macbook-air", "Colors, display and performance"),
    (range(29, 37), "airpods-pro-3", "Sound, fit, health and ANC"),
    (range(37, 46), "apple-watch-ultra-4", "Outdoor, health and battery"),
    (range(46, 47), "apple-watch-series-12", "Connectivity"),
    (range(47, 49), "apple-watch-ultra-4", "Fitness and health; model needs verification"),
    (range(49, 59), "apple-watch-series-12", "Health, finishes and product hero"),
    (range(59, 60), "iphone-18-pro", "Accessories"),
    (range(60, 61), "apple-watch-series-12", "Health"),
    (range(61, 74), "iphone-18-pro", "Camera, battery, colors and design"),
    (range(74, 83), "iphone-duo", "Foldable design and everyday use"),
    (range(83, 84), "", "Watch lineup; exact model uncertain"),
    (range(84, 85), "iphone-duo", "Foldable design"),
]


def classify(index: int) -> tuple[str, str]:
    for indices, page_id, subject in GROUPS:
        if index in indices:
            return page_id, subject
    return "", "Unclassified"


with (OUTPUT / "image-inventory.csv").open("w", newline="", encoding="utf-8") as file:
    writer = csv.writer(file, lineterminator="\n")
    writer.writerow(["index", "original_filename", "width", "height", "mode", "bytes"])
    for index, path in enumerate(images, 1):
        with Image.open(path) as image:
            writer.writerow([index, path.name, image.width, image.height, image.mode, path.stat().st_size])

with (OUTPUT / "asset-decisions.csv").open("w", newline="", encoding="utf-8") as file:
    writer = csv.writer(file, lineterminator="\n")
    writer.writerow([
        "index", "original_filename", "cms_page_id", "verified_product_id",
        "visual_subject", "section_candidate", "optimized_filename", "decision", "uncertainty",
    ])
    for index, path in enumerate(images, 1):
        page_id, subject = classify(index)
        writer.writerow([
            index, path.name, page_id, "", subject, subject, "", "reference-only",
            "Screenshot contains embedded website text/UI; original product media and exact model need verification."
            if page_id else "Screenshot shows a watch family, but the exact model is not identifiable.",
        ])

for offset in range(0, len(images), 28):
    sheet = Image.new("RGB", (1200, 1708), "#f4f4f4")
    draw = ImageDraw.Draw(sheet)
    for slot, path in enumerate(images[offset : offset + 28]):
        index = offset + slot + 1
        x = (slot % 4) * 300
        y = (slot // 4) * 244
        with Image.open(path) as source:
            thumb = ImageOps.contain(source.convert("RGB"), (280, 205))
            sheet.paste(thumb, (x + (300 - thumb.width) // 2, y + (210 - thumb.height) // 2))
        draw.text((x + 10, y + 213), f"{index:02d}  {path.name}", fill="#111111")
    sheet.save(OUTPUT / f"contact-sheet-{offset // 28 + 1}.jpg", quality=90)

approved_heroes = [
    ("iPhone 18 Pro", "public/products/story/iphone-18-pro-supplied-burgundy-front-back.jpg"),
    ("iPhone Duo", "public/products/campaigns/iphone-duo-open.webp"),
    ("Watch Series 12", "public/products/campaigns/watch-series-12-hero.webp"),
    ("Watch Ultra 4", "public/products/campaigns/watch-ultra-4-hero.webp"),
    ("AirPods Pro 3", "public/products/story/airpods-pro-3-apple.jpg"),
    ("MacBook Air", "public/products/campaigns/macbook-air-cinematic.webp"),
    ("MacBook Pro", "public/products/campaigns/macbook-pro-cinematic.webp"),
    ("Mac mini", "src/assets/homepage/homepage-mac-mini-white.webp"),
    ("iPad Air", "src/assets/catalogue-products/ipad-air-11-inch-m3-premium.webp"),
    ("iPad Pro", "public/products/campaigns/ipad-pro-cinematic.webp"),
]
sheet = Image.new("RGB", (1200, 1170), "#f4f4f4")
draw = ImageDraw.Draw(sheet)
with (OUTPUT / "approved-hero-inventory.csv").open("w", newline="", encoding="utf-8") as file:
    writer = csv.writer(file, lineterminator="\n")
    writer.writerow(["product", "path", "width", "height", "bytes"])
    for index, (product, relative_path) in enumerate(approved_heroes):
        path = ROOT / relative_path
        x, y = index % 3 * 400, index // 3 * 290
        with Image.open(path) as source:
            writer.writerow([product, relative_path, source.width, source.height, path.stat().st_size])
            thumb = ImageOps.contain(source.convert("RGB"), (370, 250))
            sheet.paste(thumb, (x + (400 - thumb.width) // 2, y + (255 - thumb.height) // 2))
        draw.text((x + 12, y + 258), product, fill="#111111")
sheet.save(OUTPUT / "approved-hero-contact-sheet.jpg", quality=90)

print(f"Inventoried {len(images)} images in {OUTPUT}")
