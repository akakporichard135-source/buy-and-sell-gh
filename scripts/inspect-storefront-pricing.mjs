import puppeteer from "puppeteer-core";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

async function inspectStorefront() {
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
  
  // Listen to network requests to Supabase
  const supabaseRequests = [];
  page.on("request", req => {
    if (req.url().includes("supabase.co")) {
      supabaseRequests.push({ url: req.url(), method: req.method() });
    }
  });

  console.log("Navigating to https://buyandsellgh.com/product/iphone-17-pro-max ...");
  await page.goto("https://buyandsellgh.com/product/iphone-17-pro-max", { waitUntil: "domcontentloaded", timeout: 40000 });
  await new Promise(r => setTimeout(r, 4000));

  console.log("Supabase requests made by public storefront:", supabaseRequests);

  const priceDetails = await page.evaluate(() => {
    // Find price text elements
    const priceElements = Array.from(document.querySelectorAll("*"))
      .filter(el => el.children.length === 0 && (el.textContent.includes("GH₵") || el.textContent.includes("20,000") || el.textContent.includes("22,500")))
      .map(el => ({ tag: el.tagName, text: el.textContent.trim() }));

    return {
      priceElements,
      title: document.title,
    };
  });

  console.log("Price elements found on page:", priceDetails.priceElements);

  await browser.close();
}

inspectStorefront().catch(console.error);
