import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const raw = await readFile(path.resolve("scripts/catalog-inventory.json"), "utf8");
const products = JSON.parse(raw);

// Reference data mapping:
// Apple US MSRP (or secondary market for discontinued items)
// Formula: Ghana retail = US MSRP * 12 * import/retail factor
const pricingProposals = [];

for (const p of products) {
  const cat = p.category;
  const slug = p.slug;
  const name = p.name;
  const cond = p.condition;
  const storageList = p.storage || [];

  // Determine market tier
  let usRefMSRP = 0;
  let refSource = "Apple US Official MSRP";
  let baseGhs = 0;
  let variants = [];

  // 1. IPHONES
  if (cat === "iPhones" || slug.startsWith("iphone-")) {
    if (slug === "iphone-16-pro-max") {
      usRefMSRP = 1199;
      // 256GB: $1199 -> GH₵ 20,500
      // 512GB: $1399 -> GH₵ 23,800
      // 1TB: $1599 -> GH₵ 27,200
      variants = [
        { storage: "256GB", price: 20500, previousPrice: 21500, condition: "Brand New" },
        { storage: "512GB", price: 23800, previousPrice: null, condition: "Brand New" },
        { storage: "1TB", price: 27200, previousPrice: null, condition: "Brand New" },
      ];
      baseGhs = 20500;
    } else if (slug === "iphone-16-pro") {
      usRefMSRP = 999;
      variants = [
        { storage: "128GB", price: 17800, previousPrice: 18500, condition: "Brand New" },
        { storage: "256GB", price: 19500, previousPrice: null, condition: "Brand New" },
        { storage: "512GB", price: 22800, previousPrice: null, condition: "Brand New" },
        { storage: "1TB", price: 25800, previousPrice: null, condition: "Brand New" },
      ];
      baseGhs = 17800;
    } else if (slug === "iphone-16-plus") {
      usRefMSRP = 899;
      variants = [
        { storage: "128GB", price: 15200, previousPrice: null, condition: "Brand New" },
        { storage: "256GB", price: 16800, previousPrice: null, condition: "Brand New" },
        { storage: "512GB", price: 19800, previousPrice: null, condition: "Brand New" },
      ];
      baseGhs = 15200;
    } else if (slug === "iphone-16") {
      usRefMSRP = 799;
      variants = [
        { storage: "128GB", price: 13500, previousPrice: 14200, condition: "Brand New" },
        { storage: "256GB", price: 15200, previousPrice: null, condition: "Brand New" },
        { storage: "512GB", price: 18200, previousPrice: null, condition: "Brand New" },
      ];
      baseGhs = 13500;
    } else if (slug === "iphone-16e") {
      usRefMSRP = 599;
      variants = [
        { storage: "128GB", price: 10200, previousPrice: null, condition: "Brand New" },
        { storage: "256GB", price: 11800, previousPrice: null, condition: "Brand New" },
        { storage: "512GB", price: 14500, previousPrice: null, condition: "Brand New" },
      ];
      baseGhs = 10200;
    } else if (slug === "iphone-15-pro-max") {
      refSource = "Secondary Market (Certified Pre-Owned / UK Used)";
      usRefMSRP = 850;
      variants = [
        { storage: "256GB", price: 14500, previousPrice: 15200, condition: "UK Used" },
        { storage: "512GB", price: 16200, previousPrice: null, condition: "UK Used" },
        { storage: "1TB", price: 17800, previousPrice: null, condition: "UK Used" },
      ];
      baseGhs = 14500;
    } else if (slug === "iphone-15-pro") {
      refSource = "Secondary Market (Certified Pre-Owned / UK Used)";
      usRefMSRP = 750;
      variants = [
        { storage: "128GB", price: 12800, previousPrice: null, condition: "UK Used" },
        { storage: "256GB", price: 13900, previousPrice: null, condition: "UK Used" },
        { storage: "512GB", price: 15200, previousPrice: null, condition: "UK Used" },
        { storage: "1TB", price: 16500, previousPrice: null, condition: "UK Used" },
      ];
      baseGhs = 12800;
    } else if (slug === "iphone-15-plus") {
      refSource = "Apple Official / Secondary Market";
      usRefMSRP = 799;
      variants = [
        { storage: "128GB", price: 11800, previousPrice: null, condition: "UK Used" },
        { storage: "256GB", price: 13200, previousPrice: null, condition: "UK Used" },
        { storage: "512GB", price: 14800, previousPrice: null, condition: "UK Used" },
      ];
      baseGhs = 11800;
    } else if (slug === "iphone-15") {
      refSource = "Apple US Official ($699) / Ghana Retail";
      usRefMSRP = 699;
      variants = [
        { storage: "128GB", price: 9800, previousPrice: 10500, condition: "Excellent" },
        { storage: "256GB", price: 11200, previousPrice: null, condition: "Excellent" },
        { storage: "512GB", price: 12800, previousPrice: null, condition: "Excellent" },
      ];
      baseGhs = 9800;
    } else if (slug === "iphone-14-pro-max") {
      refSource = "Secondary Market (UK Used)";
      usRefMSRP = 680;
      variants = [
        { storage: "128GB", price: 11200, previousPrice: null, condition: "UK Used" },
        { storage: "256GB", price: 12200, previousPrice: null, condition: "UK Used" },
        { storage: "512GB", price: 13500, previousPrice: null, condition: "UK Used" },
        { storage: "1TB", price: 14800, previousPrice: null, condition: "UK Used" },
      ];
      baseGhs = 11200;
    } else if (slug === "iphone-14-pro") {
      refSource = "Secondary Market (UK Used)";
      usRefMSRP = 580;
      variants = [
        { storage: "128GB", price: 9800, previousPrice: null, condition: "UK Used" },
        { storage: "256GB", price: 10800, previousPrice: null, condition: "UK Used" },
        { storage: "512GB", price: 11900, previousPrice: null, condition: "UK Used" },
        { storage: "1TB", price: 12900, previousPrice: null, condition: "UK Used" },
      ];
      baseGhs = 9800;
    } else if (slug === "iphone-14-plus") {
      refSource = "Secondary Market (UK Used)";
      usRefMSRP = 490;
      variants = [
        { storage: "128GB", price: 8500, previousPrice: null, condition: "UK Used" },
        { storage: "256GB", price: 9500, previousPrice: null, condition: "UK Used" },
        { storage: "512GB", price: 10800, previousPrice: null, condition: "UK Used" },
      ];
      baseGhs = 8500;
    } else if (slug === "iphone-14") {
      refSource = "Apple US Official ($599) / UK Used";
      usRefMSRP = 599;
      variants = [
        { storage: "128GB", price: 7800, previousPrice: null, condition: "UK Used" },
        { storage: "256GB", price: 8800, previousPrice: null, condition: "UK Used" },
        { storage: "512GB", price: 10000, previousPrice: null, condition: "UK Used" },
      ];
      baseGhs = 7800;
    } else if (slug === "iphone-13-pro-max") {
      refSource = "Secondary Market (UK Used)";
      usRefMSRP = 520;
      variants = [
        { storage: "128GB", price: 8200, previousPrice: 8800, condition: "Very Good" },
        { storage: "256GB", price: 9200, previousPrice: null, condition: "Very Good" },
        { storage: "512GB", price: 10200, previousPrice: null, condition: "Very Good" },
        { storage: "1TB", price: 11200, previousPrice: null, condition: "Very Good" },
      ];
      baseGhs = 8200;
    } else if (slug === "iphone-13-pro") {
      refSource = "Secondary Market (UK Used)";
      usRefMSRP = 460;
      variants = [
        { storage: "128GB", price: 7400, previousPrice: null, condition: "Very Good" },
        { storage: "256GB", price: 8200, previousPrice: null, condition: "Very Good" },
        { storage: "512GB", price: 9200, previousPrice: null, condition: "Very Good" },
        { storage: "1TB", price: 10200, previousPrice: null, condition: "Very Good" },
      ];
      baseGhs = 7400;
    } else if (slug === "iphone-13") {
      refSource = "Secondary Market (UK Used)";
      usRefMSRP = 380;
      variants = [
        { storage: "128GB", price: 6200, previousPrice: null, condition: "Very Good" },
        { storage: "256GB", price: 7200, previousPrice: null, condition: "Very Good" },
        { storage: "512GB", price: 8200, previousPrice: null, condition: "Very Good" },
      ];
      baseGhs = 6200;
    } else if (slug === "iphone-13-mini") {
      refSource = "Secondary Market (UK Used)";
      usRefMSRP = 340;
      variants = [
        { storage: "128GB", price: 5400, previousPrice: null, condition: "Very Good" },
        { storage: "256GB", price: 6200, previousPrice: null, condition: "Very Good" },
        { storage: "512GB", price: 7200, previousPrice: null, condition: "Very Good" },
      ];
      baseGhs = 5400;
    } else if (slug === "iphone-12-pro-max") {
      refSource = "Secondary Market (UK Used)";
      usRefMSRP = 410;
      variants = [
        { storage: "128GB", price: 6400, previousPrice: null, condition: "Very Good" },
        { storage: "256GB", price: 7100, previousPrice: null, condition: "Very Good" },
        { storage: "512GB", price: 7800, previousPrice: null, condition: "Very Good" },
      ];
      baseGhs = 6400;
    } else if (slug === "iphone-12-pro") {
      refSource = "Secondary Market (UK Used)";
      usRefMSRP = 360;
      variants = [
        { storage: "128GB", price: 5400, previousPrice: null, condition: "Very Good" },
        { storage: "256GB", price: 6000, previousPrice: null, condition: "Very Good" },
        { storage: "512GB", price: 6700, previousPrice: null, condition: "Very Good" },
      ];
      baseGhs = 5400;
    } else if (slug === "iphone-12") {
      refSource = "Secondary Market (UK Used)";
      usRefMSRP = 290;
      variants = [
        { storage: "64GB", price: 4400, previousPrice: null, condition: "Very Good" },
        { storage: "128GB", price: 4900, previousPrice: null, condition: "Very Good" },
        { storage: "256GB", price: 5600, previousPrice: null, condition: "Very Good" },
      ];
      baseGhs = 4400;
    } else if (slug === "iphone-12-mini") {
      refSource = "Secondary Market (UK Used)";
      usRefMSRP = 250;
      variants = [
        { storage: "64GB", price: 3900, previousPrice: null, condition: "Very Good" },
        { storage: "128GB", price: 4400, previousPrice: null, condition: "Very Good" },
        { storage: "256GB", price: 4900, previousPrice: null, condition: "Very Good" },
      ];
      baseGhs = 3900;
    } else if (slug === "iphone-11-pro-max") {
      refSource = "Secondary Market (UK Used)";
      usRefMSRP = 320;
      variants = [
        { storage: "64GB", price: 4700, previousPrice: null, condition: "Very Good" },
        { storage: "256GB", price: 5300, previousPrice: null, condition: "Very Good" },
        { storage: "512GB", price: 5800, previousPrice: null, condition: "Very Good" },
      ];
      baseGhs = 4700;
    } else if (slug.startsWith("iphone-17") || slug === "iphone-air") {
      refSource = "Future Lineup / Advance Reservation Guide";
      usRefMSRP = slug.includes("pro-max") ? 1299 : slug.includes("pro") ? 1099 : slug === "iphone-air" ? 999 : 899;
      baseGhs = slug.includes("pro-max") ? 22500 : slug.includes("pro") ? 19500 : slug === "iphone-air" ? 17500 : 15500;
      variants = storageList.map((st, idx) => ({
        storage: st,
        price: baseGhs + idx * 2500,
        previousPrice: null,
        condition: "Brand New",
      }));
    }
  }

  // 2. MACBOOKS
  else if (cat === "MacBooks") {
    if (slug === "macbook-air-13-m4") {
      usRefMSRP = 1099;
      baseGhs = 17500;
      variants = [
        { storage: "256GB", memory: "16GB", price: 17500, previousPrice: null, condition: "Brand New" },
        { storage: "512GB", memory: "16GB", price: 20500, previousPrice: null, condition: "Brand New" },
        { storage: "512GB", memory: "24GB", price: 23500, previousPrice: null, condition: "Brand New" },
        { storage: "1TB", memory: "24GB", price: 26800, previousPrice: null, condition: "Brand New" },
      ];
    } else if (slug === "macbook-air-15-m4") {
      usRefMSRP = 1299;
      baseGhs = 20500;
      variants = [
        { storage: "256GB", memory: "16GB", price: 20500, previousPrice: null, condition: "Brand New" },
        { storage: "512GB", memory: "16GB", price: 23500, previousPrice: null, condition: "Brand New" },
        { storage: "512GB", memory: "24GB", price: 26500, previousPrice: null, condition: "Brand New" },
        { storage: "1TB", memory: "24GB", price: 29800, previousPrice: null, condition: "Brand New" },
      ];
    } else if (slug === "macbook-air-13-m3") {
      refSource = "Apple US Official / Active Retail ($999)";
      usRefMSRP = 999;
      baseGhs = 15800;
      variants = [
        { storage: "256GB", memory: "16GB", price: 15800, previousPrice: 16800, condition: "Brand New" },
        { storage: "512GB", memory: "16GB", price: 18800, previousPrice: null, condition: "Brand New" },
        { storage: "512GB", memory: "24GB", price: 21800, previousPrice: null, condition: "Brand New" },
      ];
    } else if (slug === "macbook-air-15-m3") {
      refSource = "Apple US Official / Active Retail ($1199)";
      usRefMSRP = 1199;
      baseGhs = 18800;
      variants = [
        { storage: "256GB", memory: "16GB", price: 18800, previousPrice: null, condition: "Brand New" },
        { storage: "512GB", memory: "16GB", price: 21800, previousPrice: null, condition: "Brand New" },
        { storage: "512GB", memory: "24GB", price: 24800, previousPrice: null, condition: "Brand New" },
      ];
    } else if (slug === "macbook-air-13-m2") {
      refSource = "Secondary / Discontinued Market ($899)";
      usRefMSRP = 899;
      baseGhs = 13500;
      variants = [
        { storage: "256GB", memory: "8GB/16GB", price: 13500, previousPrice: 14500, condition: "Excellent" },
        { storage: "512GB", memory: "16GB", price: 16200, previousPrice: null, condition: "Excellent" },
      ];
    } else if (slug === "macbook-air-15-m2") {
      refSource = "Secondary / Discontinued Market ($1049)";
      usRefMSRP = 1049;
      baseGhs = 15800;
      variants = [
        { storage: "256GB", memory: "8GB/16GB", price: 15800, previousPrice: null, condition: "Excellent" },
        { storage: "512GB", memory: "16GB", price: 18500, previousPrice: null, condition: "Excellent" },
      ];
    } else if (slug === "macbook-air-13-m1") {
      refSource = "Secondary Market / UK Used Certified ($650)";
      usRefMSRP = 650;
      baseGhs = 9800;
      variants = [
        { storage: "256GB", memory: "8GB", price: 9800, previousPrice: 10500, condition: "Very Good" },
        { storage: "512GB", memory: "8GB/16GB", price: 11800, previousPrice: null, condition: "Very Good" },
      ];
    } else if (slug === "macbook-pro-14-m4") {
      usRefMSRP = 1599;
      baseGhs = 24500;
      variants = [
        { storage: "512GB", chip: "M4", memory: "16GB", price: 24500, previousPrice: 25800, condition: "Brand New" },
        { storage: "1TB", chip: "M4", memory: "16GB", price: 27500, previousPrice: null, condition: "Brand New" },
        { storage: "1TB", chip: "M4", memory: "24GB", price: 30500, previousPrice: null, condition: "Brand New" },
      ];
    } else if (slug === "macbook-pro-14-m4-pro-max") {
      usRefMSRP = 1999;
      baseGhs = 31000;
      variants = [
        { storage: "512GB", chip: "M4 Pro", memory: "24GB", price: 31000, previousPrice: null, condition: "Brand New" },
        { storage: "1TB", chip: "M4 Pro", memory: "24GB", price: 34000, previousPrice: null, condition: "Brand New" },
        { storage: "1TB", chip: "M4 Max", memory: "36GB", price: 46500, previousPrice: null, condition: "Brand New" },
      ];
    } else if (slug === "macbook-pro-16-m4-pro-max") {
      usRefMSRP = 2499;
      baseGhs = 38500;
      variants = [
        { storage: "512GB", chip: "M4 Pro", memory: "24GB", price: 38500, previousPrice: null, condition: "Brand New" },
        { storage: "512GB", chip: "M4 Pro", memory: "48GB", price: 44500, previousPrice: null, condition: "Brand New" },
        { storage: "1TB", chip: "M4 Max", memory: "36GB", price: 52000, previousPrice: null, condition: "Brand New" },
        { storage: "1TB", chip: "M4 Max", memory: "48GB", price: 58000, previousPrice: null, condition: "Brand New" },
      ];
    } else if (slug.includes("m3") && slug.includes("pro")) {
      refSource = "Secondary Market (UK Used / Certified Refurbished)";
      usRefMSRP = 1400;
      baseGhs = slug.includes("16") ? 28500 : 21500;
      variants = storageList.slice(0, 3).map((st, i) => ({ storage: st, price: baseGhs + i * 3000, condition: "Excellent" }));
    } else if (slug.includes("m2") && slug.includes("pro")) {
      refSource = "Secondary Market (UK Used / Certified Refurbished)";
      usRefMSRP = 1100;
      baseGhs = slug.includes("16") ? 24000 : 17500;
      variants = storageList.slice(0, 3).map((st, i) => ({ storage: st, price: baseGhs + i * 2500, condition: "Very Good" }));
    } else if (slug.includes("m1") && slug.includes("pro")) {
      refSource = "Secondary Market (UK Used / Certified Refurbished)";
      usRefMSRP = 900;
      baseGhs = slug.includes("16") ? 19500 : 14500;
      variants = storageList.slice(0, 3).map((st, i) => ({ storage: st, price: baseGhs + i * 2200, condition: "Very Good" }));
    } else if (slug.includes("m5")) {
      refSource = "Next-Gen / Future Silicon Guide";
      usRefMSRP = slug.includes("16") ? 2699 : slug.includes("14") ? 1799 : 1199;
      baseGhs = slug.includes("16") ? 41500 : slug.includes("14") ? 27500 : 19000;
      variants = storageList.map((st, i) => ({ storage: st, price: baseGhs + i * 3500, condition: "Brand New" }));
    }
  }

  // 3. IPADS
  else if (cat === "iPads") {
    if (slug === "ipad-10th-generation" || slug === "ipad-a16") {
      usRefMSRP = 349;
      baseGhs = 5800;
      variants = [
        { storage: "64GB", connectivity: "Wi-Fi", price: 5800, previousPrice: 6200, condition: "Brand New" },
        { storage: "256GB", connectivity: "Wi-Fi", price: 7800, previousPrice: null, condition: "Brand New" },
      ];
    } else if (slug === "ipad-mini-a17-pro") {
      usRefMSRP = 499;
      baseGhs = 8200;
      variants = [
        { storage: "128GB", connectivity: "Wi-Fi", price: 8200, previousPrice: null, condition: "Brand New" },
        { storage: "256GB", connectivity: "Wi-Fi", price: 9800, previousPrice: null, condition: "Brand New" },
        { storage: "512GB", connectivity: "Wi-Fi", price: 12500, previousPrice: null, condition: "Brand New" },
      ];
    } else if (slug === "ipad-mini-6") {
      refSource = "Secondary Market (UK Used)";
      usRefMSRP = 350;
      baseGhs = 5500;
      variants = [
        { storage: "64GB", price: 5500, condition: "Very Good" },
        { storage: "256GB", price: 6900, condition: "Very Good" },
      ];
    } else if (slug === "ipad-air-11-inch-m2" || slug === "ipad-air-11-inch-m3" || slug === "ipad-air-11-inch-m4") {
      usRefMSRP = 599;
      baseGhs = 10200;
      variants = [
        { storage: "128GB", connectivity: "Wi-Fi", price: 10200, previousPrice: 10800, condition: "Brand New" },
        { storage: "256GB", connectivity: "Wi-Fi", price: 11800, previousPrice: null, condition: "Brand New" },
        { storage: "512GB", connectivity: "Wi-Fi", price: 14500, previousPrice: null, condition: "Brand New" },
        { storage: "1TB", connectivity: "Wi-Fi", price: 17500, previousPrice: null, condition: "Brand New" },
      ];
    } else if (slug === "ipad-air-13-inch-m2" || slug === "ipad-air-13-inch-m3" || slug === "ipad-air-13-inch-m4") {
      usRefMSRP = 799;
      baseGhs = 13500;
      variants = [
        { storage: "128GB", connectivity: "Wi-Fi", price: 13500, previousPrice: null, condition: "Brand New" },
        { storage: "256GB", connectivity: "Wi-Fi", price: 15200, previousPrice: null, condition: "Brand New" },
        { storage: "512GB", connectivity: "Wi-Fi", price: 17800, previousPrice: null, condition: "Brand New" },
        { storage: "1TB", connectivity: "Wi-Fi", price: 20800, previousPrice: null, condition: "Brand New" },
      ];
    } else if (slug === "ipad-air-5") {
      refSource = "Secondary Market (UK Used)";
      usRefMSRP = 420;
      baseGhs = 6800;
      variants = [
        { storage: "64GB", price: 6800, condition: "Excellent" },
        { storage: "256GB", price: 8200, condition: "Excellent" },
      ];
    } else if (slug === "ipad-pro-11-inch-m4" || slug === "ipad-pro-11-inch-m5") {
      usRefMSRP = 999;
      baseGhs = 17200;
      variants = [
        { storage: "256GB", connectivity: "Wi-Fi", price: 17200, previousPrice: 18000, condition: "Brand New" },
        { storage: "512GB", connectivity: "Wi-Fi", price: 20200, previousPrice: null, condition: "Brand New" },
        { storage: "1TB", connectivity: "Wi-Fi", price: 25500, previousPrice: null, condition: "Brand New" },
        { storage: "2TB", connectivity: "Wi-Fi", price: 31000, previousPrice: null, condition: "Brand New" },
      ];
    } else if (slug === "ipad-pro-13-inch-m4" || slug === "ipad-pro-13-inch-m5") {
      usRefMSRP = 1299;
      baseGhs = 21500;
      variants = [
        { storage: "256GB", connectivity: "Wi-Fi", price: 21500, previousPrice: 22800, condition: "Brand New" },
        { storage: "512GB", connectivity: "Wi-Fi", price: 24500, previousPrice: null, condition: "Brand New" },
        { storage: "1TB", connectivity: "Wi-Fi", price: 29800, previousPrice: null, condition: "Brand New" },
        { storage: "2TB", connectivity: "Wi-Fi", price: 35500, previousPrice: null, condition: "Brand New" },
      ];
    } else if (slug.includes("m2") && slug.includes("pro")) {
      refSource = "Secondary Market (UK Used / Certified Refurbished)";
      usRefMSRP = 680;
      baseGhs = slug.includes("12") ? 14800 : 11800;
      variants = storageList.slice(0, 3).map((st, i) => ({ storage: st, price: baseGhs + i * 2000, condition: "Excellent" }));
    } else if (slug === "ipad-pro") {
      refSource = "Catalog Existing Price";
      baseGhs = p.price > 0 ? p.price : 13800;
      variants = [{ storage: storageList[0] || "128GB", price: baseGhs, condition: "Excellent" }];
    }
  }

  // 4. APPLE WATCH
  else if (cat === "Apple Watches") {
    if (slug === "apple-watch-ultra-2" || slug === "apple-watch-ultra-3" || slug === "apple-watch-ultra-4") {
      usRefMSRP = 799;
      baseGhs = 12500;
      variants = [
        { connectivity: "GPS + Cellular", screenSize: "49mm", price: 12500, previousPrice: 13500, condition: "Brand New" },
      ];
    } else if (slug === "apple-watch-ultra") {
      refSource = "Secondary Market (UK Used)";
      usRefMSRP = 480;
      baseGhs = 7800;
      variants = [
        { connectivity: "GPS + Cellular", screenSize: "49mm", price: 7800, condition: "Very Good" },
      ];
    } else if (slug === "apple-watch-series-10" || slug === "apple-watch-series-11" || slug === "apple-watch-series-12") {
      usRefMSRP = 399;
      baseGhs = 6800;
      variants = [
        { connectivity: "GPS", screenSize: "42mm", price: 6800, previousPrice: 7200, condition: "Brand New" },
        { connectivity: "GPS", screenSize: "46mm", price: 7400, previousPrice: null, condition: "Brand New" },
        { connectivity: "GPS + Cellular", screenSize: "42mm", price: 8400, previousPrice: null, condition: "Brand New" },
        { connectivity: "GPS + Cellular", screenSize: "46mm", price: 9000, previousPrice: null, condition: "Brand New" },
      ];
    } else if (slug === "apple-watch-series-9") {
      refSource = "Secondary Market (UK Used / Discontinued)";
      usRefMSRP = 280;
      baseGhs = 4600;
      variants = [
        { connectivity: "GPS", screenSize: "41mm", price: 4600, condition: "Very Good" },
        { connectivity: "GPS", screenSize: "45mm", price: 5100, condition: "Very Good" },
      ];
    } else if (slug === "apple-watch-series-8") {
      refSource = "Secondary Market (UK Used)";
      usRefMSRP = 220;
      baseGhs = 3800;
      variants = [
        { connectivity: "GPS", screenSize: "41mm", price: 3800, condition: "Very Good" },
        { connectivity: "GPS", screenSize: "45mm", price: 4200, condition: "Very Good" },
      ];
    } else if (slug === "apple-watch-series-7") {
      refSource = "Secondary Market (UK Used)";
      usRefMSRP = 180;
      baseGhs = 3100;
      variants = [
        { connectivity: "GPS", screenSize: "41mm", price: 3100, condition: "Very Good" },
        { connectivity: "GPS", screenSize: "45mm", price: 3500, condition: "Very Good" },
      ];
    } else if (slug === "apple-watch-se-3" || slug === "apple-watch-se-2") {
      usRefMSRP = 249;
      baseGhs = slug.includes("se-3") ? 4200 : 3200;
      variants = [
        { connectivity: "GPS", screenSize: "40mm", price: baseGhs, condition: slug.includes("se-3") ? "Brand New" : "Very Good" },
        { connectivity: "GPS", screenSize: "44mm", price: baseGhs + 500, condition: slug.includes("se-3") ? "Brand New" : "Very Good" },
      ];
    } else if (slug === "apple-watch") {
      refSource = "Catalog Existing Price";
      baseGhs = p.price > 0 ? p.price : 2600;
      variants = [{ price: baseGhs, condition: "Excellent" }];
    }
  }

  // 5. AIRPODS
  else if (cat === "AirPods") {
    if (slug === "airpods-4") {
      usRefMSRP = 129;
      baseGhs = 2100;
      variants = [{ title: "AirPods 4 (USB-C)", price: 2100, condition: "Brand New" }];
    } else if (slug === "airpods-4-anc") {
      usRefMSRP = 179;
      baseGhs = 2800;
      variants = [{ title: "AirPods 4 with ANC", price: 2800, previousPrice: 3000, condition: "Brand New" }];
    } else if (slug === "airpods-pro-2" || slug === "airpods-pro-3") {
      usRefMSRP = 249;
      baseGhs = 3600;
      variants = [{ title: "AirPods Pro 2 (USB-C MagSafe)", price: 3600, previousPrice: 3900, condition: "Brand New" }];
    } else if (slug === "airpods-pro-1" || slug === "airpods-pro") {
      refSource = "Secondary Market (UK Used / Certified Refurbished)";
      usRefMSRP = 140;
      baseGhs = 2200;
      variants = [{ title: "AirPods Pro (1st gen)", price: 2200, condition: "Very Good" }];
    } else if (slug === "airpods-3rd-generation") {
      refSource = "Secondary Market (UK Used)";
      usRefMSRP = 110;
      baseGhs = 1900;
      variants = [{ title: "AirPods 3", price: 1900, condition: "Very Good" }];
    } else if (slug === "airpods-2nd-generation") {
      refSource = "Secondary Market (UK Used)";
      usRefMSRP = 80;
      baseGhs = 1400;
      variants = [{ title: "AirPods 2", price: 1400, condition: "Very Good" }];
    } else if (slug === "airpods-max-usb-c" || slug === "airpods-max-2") {
      usRefMSRP = 549;
      baseGhs = 8900;
      variants = [{ title: "AirPods Max (USB-C)", price: 8900, condition: "Brand New" }];
    } else if (slug === "airpods-max-lightning") {
      refSource = "Secondary Market (UK Used)";
      usRefMSRP = 380;
      baseGhs = 6200;
      variants = [{ title: "AirPods Max (Lightning)", price: 6200, condition: "Very Good" }];
    }
  }

  // 6. ACCESSORIES
  else if (cat === "Accessories") {
    if (slug === "apple-20w-usb-c-power-adapter") {
      usRefMSRP = 19;
      baseGhs = 350;
      variants = [{ title: "20W USB-C", price: 350, condition: "Brand New" }];
    } else if (slug === "apple-30w-usb-c-power-adapter") {
      usRefMSRP = 39;
      baseGhs = 550;
      variants = [{ title: "30W USB-C", price: 550, condition: "Brand New" }];
    } else if (slug === "apple-35w-dual-usb-c-power-adapter") {
      usRefMSRP = 59;
      baseGhs = 850;
      variants = [{ title: "35W Dual USB-C", price: 850, condition: "Brand New" }];
    } else if (slug === "apple-70w-usb-c-power-adapter") {
      usRefMSRP = 59;
      baseGhs = 950;
      variants = [{ title: "70W USB-C", price: 950, condition: "Brand New" }];
    } else if (slug === "apple-96w-usb-c-power-adapter") {
      usRefMSRP = 79;
      baseGhs = 1250;
      variants = [{ title: "96W USB-C", price: 1250, condition: "Brand New" }];
    } else if (slug === "apple-140w-usb-c-power-adapter") {
      usRefMSRP = 99;
      baseGhs = 1600;
      variants = [{ title: "140W USB-C", price: 1600, condition: "Brand New" }];
    } else if (slug === "apple-magsafe-charger") {
      usRefMSRP = 39;
      baseGhs = 650;
      variants = [{ title: "MagSafe Charger (1m)", price: 650, condition: "Brand New" }];
    } else if (slug === "apple-usb-c-charge-cable" || slug === "apple-60w-usb-c-charge-cable") {
      usRefMSRP = 19;
      baseGhs = 320;
      variants = [{ title: "60W USB-C Cable (1m)", price: 320, condition: "Brand New" }];
    } else if (slug === "apple-240w-usb-c-charge-cable") {
      usRefMSRP = 29;
      baseGhs = 480;
      variants = [{ title: "240W USB-C Cable (2m)", price: 480, condition: "Brand New" }];
    } else if (slug === "apple-usb-c-to-lightning-cable") {
      usRefMSRP = 19;
      baseGhs = 320;
      variants = [{ title: "USB-C to Lightning (1m)", price: 320, condition: "Brand New" }];
    } else if (slug === "apple-usb-c-to-magsafe-3-cable") {
      usRefMSRP = 49;
      baseGhs = 780;
      variants = [{ title: "USB-C to MagSafe 3 (2m)", price: 780, condition: "Brand New" }];
    } else if (slug === "apple-watch-magnetic-fast-charger-usb-c") {
      usRefMSRP = 29;
      baseGhs = 480;
      variants = [{ title: "Watch Fast Charger (1m)", price: 480, condition: "Brand New" }];
    } else if (slug.includes("case")) {
      usRefMSRP = 49;
      baseGhs = 750;
      variants = [{ title: "MagSafe Case", price: 750, condition: "Brand New" }];
    } else if (slug === "apple-pencil-usb-c") {
      usRefMSRP = 79;
      baseGhs = 1250;
      variants = [{ title: "Apple Pencil (USB-C)", price: 1250, condition: "Brand New" }];
    } else if (slug === "apple-pencil-pro") {
      usRefMSRP = 129;
      baseGhs = 2100;
      variants = [{ title: "Apple Pencil Pro", price: 2100, condition: "Brand New" }];
    } else if (slug === "apple-magic-keyboard-ipad") {
      usRefMSRP = 299;
      baseGhs = 4800;
      variants = [
        { title: "Magic Keyboard for iPad (11-inch)", price: 4800, condition: "Brand New" },
        { title: "Magic Keyboard for iPad (13-inch)", price: 5400, condition: "Brand New" },
      ];
    } else if (slug === "apple-magic-keyboard-folio") {
      usRefMSRP = 249;
      baseGhs = 3900;
      variants = [{ title: "Magic Keyboard Folio (iPad 10th)", price: 3900, condition: "Brand New" }];
    } else if (slug === "apple-magic-mouse") {
      usRefMSRP = 79;
      baseGhs = 1250;
      variants = [{ title: "Magic Mouse (USB-C)", price: 1250, condition: "Brand New" }];
    } else if (slug === "apple-magic-trackpad") {
      usRefMSRP = 129;
      baseGhs = 2100;
      variants = [{ title: "Magic Trackpad (USB-C)", price: 2100, condition: "Brand New" }];
    } else if (slug === "apple-magic-keyboard") {
      usRefMSRP = 99;
      baseGhs = 1600;
      variants = [{ title: "Magic Keyboard", price: 1600, condition: "Brand New" }];
    } else if (slug === "apple-magic-keyboard-touch-id") {
      usRefMSRP = 149;
      baseGhs = 2400;
      variants = [{ title: "Magic Keyboard with Touch ID", price: 2400, condition: "Brand New" }];
    }
  }

  // Fallback if not specifically caught
  if (baseGhs === 0) {
    if (p.price > 0) {
      baseGhs = p.price;
      variants = [{ price: baseGhs, condition: cond }];
    } else {
      baseGhs = 5000;
      refSource = "Estimated Review Needed";
      variants = [{ price: baseGhs, condition: cond }];
    }
  }

  pricingProposals.push({
    id: p.id,
    slug,
    name,
    category: cat,
    subcategory: p.subcategory,
    condition: cond,
    currentPrice: p.price,
    currentPriceOnRequest: p.priceOnRequest,
    usRefMSRP,
    refSource,
    proposedBaseGhs: baseGhs,
    variants,
  });
}

const outPath = path.resolve("scripts/proposed-pricing.json");
await writeFile(outPath, JSON.stringify(pricingProposals, null, 2), "utf8");
console.log(`Successfully generated proposed pricing for ${pricingProposals.length} products to ${outPath}`);
