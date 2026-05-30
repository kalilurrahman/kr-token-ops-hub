const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 },
  });

  const urls = [
    { url: "https://kr-token-ops-hub.lovable.app/", name: "home" },
    { url: "https://kr-token-ops-hub.lovable.app/hub", name: "hub" },
    { url: "https://kr-token-ops-hub.lovable.app/guide", name: "guide" },
    { url: "https://kr-token-ops-hub.lovable.app/patterns", name: "patterns" },
    { url: "https://kr-token-ops-hub.lovable.app/calculator", name: "calculator" },
    { url: "https://kr-token-ops-hub.lovable.app/dashboard", name: "dashboard" },
    { url: "https://kr-token-ops-hub.lovable.app/library", name: "library" },
  ];

  for (const item of urls) {
    await page.goto(item.url, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000); // wait for animations
    await page.screenshot({ path: `public/${item.name}.png`, fullPage: false });
    console.log(`Saved screenshot for ${item.name}`);
  }

  await browser.close();
})();
