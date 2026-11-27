#!/usr/bin/env node
// Draws public/og.png, the 1200×630 share card, from the HTML below.
// Fonts are the site's own (Space Grotesk, IBM Plex Sans, IBM Plex Mono), read as files so the
// card does not depend on the network: pass the folder that holds the three .woff2 files.
//
//   CHROMIUM_PATH=/path/to/chromium node scripts/make-share-card.mjs <fonts-dir>
//
// The card carries no figures, so it cannot go stale. Colours are the Ledger Dark tokens in
// src/styles.css (--to-bg, --to-surface-2, --to-ink, --to-ink-2, --to-money).
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const fontsDir = process.argv[2];
if (!fontsDir) throw new Error("usage: node scripts/make-share-card.mjs <fonts-dir>");
const font = (file) => readFileSync(join(fontsDir, file)).toString("base64");
const face = (family, weight, file) =>
  `@font-face{font-family:'${family}';font-weight:${weight};src:url(data:font/woff2;base64,${font(file)}) format('woff2')}`;

const html = `<!doctype html><html><head><style>
${face("Space Grotesk", 700, "space-grotesk-latin-700-normal.woff2")}
${face("IBM Plex Sans", 400, "ibm-plex-sans-latin-400-normal.woff2")}
${face("IBM Plex Mono", 500, "ibm-plex-mono-latin-500-normal.woff2")}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;background:#070a10;color:#f3efe6;font-family:'IBM Plex Sans',sans-serif;position:relative;overflow:hidden}
.grid{position:absolute;inset:0;background-image:linear-gradient(#ffffff08 1px,transparent 1px),linear-gradient(90deg,#ffffff08 1px,transparent 1px);background-size:40px 40px}
.bar{position:absolute;left:0;top:0;bottom:0;width:10px;background:#e8b964}
.in{position:absolute;inset:0;padding:96px 96px 64px 106px;display:flex;flex-direction:column;justify-content:space-between}
.eyebrow{font-family:'IBM Plex Mono',monospace;font-weight:500;font-size:22px;letter-spacing:.2em;color:#e8b964}
h1{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:124px;letter-spacing:-.03em;line-height:1;margin-top:26px}
h1 span{color:#e8b964}
.sub{font-size:36px;color:#b9b2a3;margin-top:30px;max-width:900px;line-height:1.3}
.foot{font-family:'IBM Plex Mono',monospace;font-size:22px;color:#b9b2a3;text-align:right}
</style></head><body><div class="grid"></div><div class="bar"></div><div class="in">
<div><div class="eyebrow">FINOPS FOR TOKENS</div><h1>TokenOps <span>Atlas</span></h1>
<div class="sub">Run LLM spend like a professional operating discipline.</div></div>
<div class="foot">tokenops.kalilurrahman.com</div></div></body></html>`;

const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
);
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html);
await page.evaluate(() => document.fonts.ready);
// Fail if any text runs off the card.
const overflow = await page.evaluate(() =>
  [...document.querySelectorAll("h1,.sub,.eyebrow,.foot")].some(
    (el) => el.scrollWidth > el.clientWidth + 1 || el.getBoundingClientRect().right > 1200,
  ),
);
if (overflow) throw new Error("share card text overflows");
await page.screenshot({ path: join(ROOT, "public", "og.png") });
await browser.close();
console.log("wrote public/og.png (1200×630)");
