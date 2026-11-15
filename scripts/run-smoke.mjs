#!/usr/bin/env node
/**
 * Build → preview → smoke → teardown.
 *
 *   npm run smoke                 # compare against .smoke/baseline
 *   npm run smoke -- --baseline   # rewrite the baseline (untouched UI only)
 *   npm run smoke -- --no-build   # reuse the current build output
 *
 * The Lovable/TanStack config builds with Nitro's `cloudflare-module` preset,
 * whose output (.output/) is served by `wrangler dev`, not `vite preview`.
 * We read the preview command Nitro records in .output/nitro.json and fall
 * back to `vite preview` when a plain Vite build (dist/) is produced instead.
 */
import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import net from "node:net";

const HOST = "127.0.0.1";
const PORT = Number(process.env.SMOKE_PORT ?? 4173);
const args = process.argv.slice(2);
const skipBuild = args.includes("--no-build");
const smokeArgs = args.filter((a) => a !== "--no-build");

const isWin = process.platform === "win32";
const npx = isWin ? "npx.cmd" : "npx";

function run(cmd, cmdArgs, opts = {}) {
  return new Promise((resolve) => {
    const child = spawn(cmd, cmdArgs, { stdio: "inherit", ...opts });
    child.on("exit", (code, signal) => resolve(code ?? (signal ? 1 : 0)));
  });
}

function portOpen(port, host) {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host });
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("error", () => resolve(false));
  });
}

async function waitForHttp(url, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await portOpen(PORT, HOST)) {
      try {
        const res = await fetch(url);
        if (res.status < 500) return true;
      } catch {
        /* not ready yet */
      }
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

if (await portOpen(PORT, HOST)) {
  console.error(`Port ${PORT} is already in use — stop the other server or set SMOKE_PORT.`);
  process.exit(1);
}

if (!skipBuild) {
  const code = await run(npx, ["vite", "build"]);
  if (code !== 0) {
    console.error("Build failed — smoke not run.");
    process.exit(code);
  }
}

let previewCmd;
let previewArgs;
if (existsSync(".output/nitro.json")) {
  const nitro = JSON.parse(readFileSync(".output/nitro.json", "utf8"));
  if (String(nitro.preset ?? "").startsWith("cloudflare")) {
    previewCmd = npx;
    previewArgs = [
      "wrangler",
      "dev",
      "--cwd",
      ".output",
      "--config",
      "server/wrangler.json",
      "--ip",
      HOST,
      "--port",
      String(PORT),
      "--log-level",
      "warn",
    ];
  }
}
if (!previewCmd) {
  previewCmd = npx;
  previewArgs = ["vite", "preview", "--host", HOST, "--port", String(PORT), "--strictPort"];
}

console.log(`\n▶ preview: ${previewArgs.slice(0, 2).join(" ")} on http://${HOST}:${PORT}`);
const preview = spawn(previewCmd, previewArgs, {
  stdio: ["ignore", "inherit", "inherit"],
  env: { ...process.env, WRANGLER_SEND_METRICS: "false", CI: process.env.CI ?? "1" },
  detached: !isWin,
});

const stopPreview = () => {
  if (preview.exitCode !== null) return;
  try {
    if (isWin) preview.kill();
    else process.kill(-preview.pid, "SIGTERM");
  } catch {
    /* already gone */
  }
};
process.on("SIGINT", () => {
  stopPreview();
  process.exit(130);
});

const baseUrl = process.env.BASE_URL ?? `http://${HOST}:${PORT}`;
const ready = await waitForHttp(`${baseUrl}/`, 90_000);
if (!ready) {
  console.error(`Preview server did not become ready on ${baseUrl}`);
  stopPreview();
  process.exit(1);
}

const code = await run(process.execPath, ["scripts/smoke.mjs", ...smokeArgs], {
  env: { ...process.env, BASE_URL: baseUrl },
});
stopPreview();
process.exit(code);
