import puppeteer from "puppeteer-core";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

async function checkLivePrice() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-gpu",
      "--host-resolver-rules=MAP admin.buyandsellgh.com 216.198.79.65, MAP buyandsellgh.com 64.29.17.1",
    ],
  });

  const page = await browser.newPage();
  await page.goto("https://buyandsellgh.com/product/iphone-17-pro-max", { waitUntil: "domcontentloaded", timeout: 40000 });
  await new Promise(r => setTimeout(r, 4000));

  const text = await page.evaluate(() => document.body.innerText);
  console.log("Includes GH₵ 20,000?", text.includes("20,000"));
  console.log("Includes GH₵ 22,500?", text.includes("22,500"));

  // Check card on store page
  await page.goto("https://buyandsellgh.com/store", { waitUntil: "domcontentloaded", timeout: 40000 });
  await new Promise(r => setTimeout(r, 4000));
  const storeText = await page.evaluate(() => {
    const card = Array.from(document.querySelectorAll("article, [data-product-id]")).find(el => el.innerText.includes("iPhone 17 Pro Max"));
    return card ? card.innerText : "Card not found";
  });
  console.log("Storefront card for iPhone 17 Pro Max:\n", storeText);

  await browser.close();
}

checkLivePrice().catch(console.error);
