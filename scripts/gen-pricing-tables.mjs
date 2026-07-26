#!/usr/bin/env node
/**
 * Regenerates the two provider-comparison markdown files from data/pricing.json.
 * Run after any pricing.json change:  node scripts/gen-pricing-tables.mjs
 *
 * Also refreshes the bundled copies in src/tokenops/documents.json so the
 * in-browser reader shows the freshly regenerated content.
 *
 * Pipeline / SLA: data/README.md.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const pricing = JSON.parse(readFileSync(join(ROOT, "data/pricing.json"), "utf8"));

const money = (n) =>
  n == null
    ? "—"
    : `$${Number(n)
        .toFixed(Number(n) < 1 ? 3 : 2)
        .replace(/\.?0+$/, "")}`;
const ctx = (n) => (n >= 1_000_000 ? `${n / 1_000_000}M` : `${n / 1_000}K`);
const tierLabel = { frontier: "Frontier", reasoning: "Reasoning", mid: "Mid", cheap: "Cheap" };

const banner = `<!-- AUTO-GENERATED FROM data/pricing.json — DO NOT HAND-EDIT.
     Run \`node scripts/gen-pricing-tables.mjs\` after editing pricing.json.
     Pipeline and SLA: data/README.md. -->`;

function tokenPricingReference() {
  const lines = [];
  lines.push(banner, "");
  lines.push("# Token Pricing Reference — Major LLM Providers");
  lines.push("");
  lines.push(
    `> **Snapshot of \`data/pricing.json\` (v${pricing.meta.version}) — reviewed ${pricing.meta.reviewed_date}.**`,
  );
  lines.push(
    "> This file is regenerated from the dataset. To propose a correction, edit `data/pricing.json` and re-run the generator.",
  );
  lines.push(
    `> **Live changelog:** [data/pricing-changelog.md](https://github.com/kalilurrahman/kr-token-ops-hub/blob/main/data/pricing-changelog.md). **SLA:** ${pricing.meta.sla}`,
  );
  lines.push("", "---", "", "## Pricing Tables", "");
  for (const [_pk, provider] of Object.entries(pricing.providers)) {
    lines.push(`### ${provider.label}`, "");
    lines.push(
      "| Model | Input ($/1M) | Cached Input ($/1M) | Output ($/1M) | Context | Tier | Source |",
    );
    lines.push("|---|---|---|---|---|---|---|");
    for (const m of Object.values(provider.models)) {
      const overNote =
        m.input_per_mtok_over_200k != null
          ? ` / ${money(m.input_per_mtok_over_200k)} (>200K ctx)`
          : "";
      const outNote =
        m.output_per_mtok_over_200k != null
          ? ` / ${money(m.output_per_mtok_over_200k)} (>200K ctx)`
          : "";
      lines.push(
        `| ${m.display_name} | ${money(m.input_per_mtok)}${overNote} | ${money(m.cached_input_per_mtok)} | ${money(m.output_per_mtok)}${outNote} | ${ctx(m.context_tokens)} | ${tierLabel[m.tier] ?? m.tier} | [verified ${m.verified_date}](${m.verified_url}) |`,
      );
    }
    if (provider.prompt_caching_notes) {
      lines.push("", `_Caching:_ ${provider.prompt_caching_notes}`);
    }
    if (provider.batch_discount_percent != null) {
      lines.push(
        "",
        `_Batch API:_ ${provider.batch_discount_percent}% off standard rates, ~${provider.batch_sla_hours}h SLA.`,
      );
    }
    lines.push("");
  }
  lines.push("---", "");
  lines.push("## How to price a request", "");
  lines.push("```");
  lines.push("cost_per_request = (input_tokens  × input_$/M  ÷ 1_000_000)");
  lines.push("                 + (output_tokens × output_$/M ÷ 1_000_000)");
  lines.push("```");
  lines.push("");
  lines.push("With prompt caching on the input:");
  lines.push("```");
  lines.push("cost_per_request ≈ ((1-hit_rate) × input_tokens × input_$/M");
  lines.push("                  +  hit_rate    × input_tokens × cached_input_$/M");
  lines.push("                  +  output_tokens × output_$/M) ÷ 1_000_000");
  lines.push("```");
  lines.push("");
  lines.push(
    "The site's calculators (`/calculator`, `/hub`) apply these formulas against this same dataset.",
  );
  return lines.join("\n") + "\n";
}

function providerComparisonMatrix() {
  const lines = [];
  lines.push(banner, "");
  lines.push("# LLM Provider Comparison Matrix");
  lines.push("");
  lines.push(
    `> **Snapshot of \`data/pricing.json\` (v${pricing.meta.version}) — reviewed ${pricing.meta.reviewed_date}.**`,
  );
  lines.push("> Regenerated from the dataset; edit `data/pricing.json` to correct.");
  lines.push(
    `> **Live changelog:** [data/pricing-changelog.md](https://github.com/kalilurrahman/kr-token-ops-hub/blob/main/data/pricing-changelog.md).`,
  );
  lines.push("", "---", "", "## Per-Token Pricing (USD per 1M tokens)", "");
  lines.push("| Provider | Model | Input | Cached Input | Output | Context | Tier |");
  lines.push("|---|---|---|---|---|---|---|");
  for (const provider of Object.values(pricing.providers)) {
    for (const m of Object.values(provider.models)) {
      lines.push(
        `| **${provider.label}** | ${m.display_name} | ${money(m.input_per_mtok)} | ${money(m.cached_input_per_mtok)} | ${money(m.output_per_mtok)} | ${ctx(m.context_tokens)} | ${tierLabel[m.tier] ?? m.tier} |`,
      );
    }
  }
  lines.push("");
  lines.push("### Batch API discounts");
  lines.push("");
  lines.push("| Provider | Batch discount | SLA |");
  lines.push("|---|---|---|");
  for (const provider of Object.values(pricing.providers)) {
    if (provider.batch_discount_percent != null) {
      lines.push(
        `| ${provider.label} | ${provider.batch_discount_percent}% off | ~${provider.batch_sla_hours}h |`,
      );
    }
  }
  lines.push("");
  lines.push("### Prompt caching");
  lines.push("");
  for (const provider of Object.values(pricing.providers)) {
    if (provider.prompt_caching_notes) {
      lines.push(`- **${provider.label}:** ${provider.prompt_caching_notes}`);
    }
  }
  lines.push("");
  lines.push("---", "");
  lines.push("## Provider pricing pages", "");
  lines.push("| Provider | URL |");
  lines.push("|---|---|");
  for (const provider of Object.values(pricing.providers)) {
    lines.push(`| ${provider.label} | ${provider.pricing_url} |`);
  }
  lines.push("");
  return lines.join("\n") + "\n";
}

const outputs = [
  {
    path: "public/templates/token-pricing-reference.md",
    bundleKey: null,
    bundleSection: null,
    content: tokenPricingReference(),
  },
  {
    path: "public/library/references/provider-comparison-matrix.md",
    bundleKey: "references/provider-comparison-matrix.md",
    bundleSection: "library",
    content: providerComparisonMatrix(),
  },
  {
    path: null,
    bundleKey: "token-pricing-reference.md",
    bundleSection: "templates",
    content: tokenPricingReference(),
  },
];

for (const o of outputs) {
  if (o.path) {
    writeFileSync(join(ROOT, o.path), o.content);
    console.log(`wrote ${o.path}`);
  }
}

// Sync bundled copies in documents.json (used by the in-browser reader)
const docsPath = join(ROOT, "src/tokenops/documents.json");
const docs = JSON.parse(readFileSync(docsPath, "utf8"));
for (const o of outputs) {
  if (o.bundleSection && o.bundleKey) {
    docs[o.bundleSection][o.bundleKey] = o.content;
  }
}
writeFileSync(docsPath, JSON.stringify(docs, null, 2) + "\n");
console.log("synced src/tokenops/documents.json");
