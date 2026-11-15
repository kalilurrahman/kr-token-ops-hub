/**
 * Release version shown in the footer watermark.
 *
 * Single source of truth: the "version" field in package.json (Vite inlines only this field).
 * To release: bump package.json "version" and add a matching "## x.y.z" entry at the top of
 * CHANGELOG.md — src/lib/release.test.ts fails if the two disagree.
 */
import { version } from "../../package.json";

export const RELEASE_VERSION: string = version;
export const RELEASE_LABEL = `v${version}`;
