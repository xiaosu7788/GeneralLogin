import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";

const source = resolve(".docs");
const destination = resolve(".output", "docs");
const legacyPublicDestination = resolve("public", "docs");

if (!existsSync(source)) {
  throw new Error(`Documentation build output not found: ${source}`);
}

rmSync(legacyPublicDestination, { recursive: true, force: true });
rmSync(destination, { recursive: true, force: true });
mkdirSync(dirname(destination), { recursive: true });
cpSync(source, destination, { recursive: true });

console.log(`Copied private documentation to ${destination}`);
