async function checkUrl(url) {
  console.log(`\n=== Checking ${url} ===`);
  const r = await fetch(url, { headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' } });
  const html = await r.text();
  const cssMatches = html.match(/href="\/assets\/[^"]+\.css"/g);
  const jsMatches = html.match(/src="\/assets\/[^"]+\.js"/g);
  console.log("Status:", r.status);
  console.log("Vercel ID:", r.headers.get("x-vercel-id"));
  console.log("Vercel Cache:", r.headers.get("x-vercel-cache"));
  console.log("Age:", r.headers.get("age"));
  console.log("CSS files:", cssMatches);
  console.log("JS files:", jsMatches);

  if (cssMatches && cssMatches[0]) {
    const cssPath = cssMatches[0].replace('href="', '').replace('"', '');
    const cssUrl = url.replace(/\/$/, "") + cssPath;
    console.log("Fetching CSS:", cssUrl);
    const cssRes = await fetch(cssUrl);
    const cssText = await cssRes.text();
    console.log("CSS Length:", cssText.length);
    console.log("Contains home-ref-airpods-pro-3:", cssText.includes("home-ref-airpods-pro-3"));
    console.log("Contains clamp(500px, 75svh:", cssText.includes("clamp(500px, 75svh"));
  }
}

async function main() {
  await checkUrl("https://buyandsellgh.com");
  await checkUrl("https://buy-and-sell-ijvtuf514-richard-akakpo-s-projects.vercel.app");
}

main().catch(console.error);
