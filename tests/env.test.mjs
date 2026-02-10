import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { resolveExaApiKey } from "../scripts/env.mjs";

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "exa-search-test-"));
}

test("uses EXA_API_KEY from process env when present", () => {
  const cwd = makeTempDir();
  fs.writeFileSync(path.join(cwd, ".env"), "EXA_API_KEY=from-dotenv\n", "utf8");

  const result = resolveExaApiKey({
    env: { EXA_API_KEY: "from-process" },
    cwd,
    projectRoot: cwd,
  });

  assert.equal(result, "from-process");
});

test("uses EXA_API_KEY from cwd .env when process env missing", () => {
  const cwd = makeTempDir();
  fs.writeFileSync(path.join(cwd, ".env"), "EXA_API_KEY=from-cwd-dotenv\n", "utf8");

  const result = resolveExaApiKey({
    env: {},
    cwd,
    projectRoot: cwd,
  });

  assert.equal(result, "from-cwd-dotenv");
});

test("uses EXA_API_KEY from project root .env when cwd .env is missing", () => {
  const cwd = makeTempDir();
  const projectRoot = makeTempDir();
  fs.writeFileSync(path.join(projectRoot, ".env"), "EXA_API_KEY=from-root-dotenv\n", "utf8");

  const result = resolveExaApiKey({
    env: {},
    cwd,
    projectRoot,
  });

  assert.equal(result, "from-root-dotenv");
});

test("returns empty string when no EXA_API_KEY is available", () => {
  const cwd = makeTempDir();

  const result = resolveExaApiKey({
    env: {},
    cwd,
    projectRoot: cwd,
  });

  assert.equal(result, "");
});
