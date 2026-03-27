#!/usr/bin/env node

import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const rootDir = ".github";
const yamlFilePattern = /\.(ya?ml)$/i;

const oldLocalRefPattern = /^\s*uses:\s*\.\/*\.github\/actions\//;
const holdexCheckoutRefPattern = /\.holdex-actions\/\.github\/actions\//;

const collectFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const nestedPaths = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = join(directory, entry.name);
      if (entry.isDirectory()) {
        return collectFiles(fullPath);
      }
      return yamlFilePattern.test(entry.name) ? [fullPath] : [];
    }),
  );

  return nestedPaths.flat();
};

const main = async () => {
  const files = await collectFiles(rootDir);
  const oldRefs = [];
  const checkoutRefs = [];

  for (const filePath of files) {
    const content = await readFile(filePath, "utf8");
    const lines = content.split("\n");

    lines.forEach((line, index) => {
      if (oldLocalRefPattern.test(line)) {
        oldRefs.push(`${filePath}:${index + 1}: ${line.trim()}`);
      }

      if (holdexCheckoutRefPattern.test(line)) {
        checkoutRefs.push(`${filePath}:${index + 1}: ${line.trim()}`);
      }
    });
  }

  console.log("Checking action path references in .github...");

  if (checkoutRefs.length > 0) {
    console.log("\nFound .holdex-actions references:");
    checkoutRefs.forEach((entry) => console.log(`- ${entry}`));
  } else {
    console.log("\nNo .holdex-actions references found.");
  }

  if (oldRefs.length > 0) {
    console.error("\nFound deprecated local action references:");
    oldRefs.forEach((entry) => console.error(`- ${entry}`));
    console.error(
      "\nReplace './.github/actions/...' with './.holdex-actions/.github/actions/...'.",
    );
    process.exit(1);
  }

  console.log("\nNo deprecated './.github/actions/...' references found.");
};

main().catch((error) => {
  console.error("Failed to verify action path references.");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
