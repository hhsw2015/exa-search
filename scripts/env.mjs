import fs from "node:fs";
import path from "node:path";

function decodeEnvValue(rawValue) {
  if (!rawValue) return "";

  if (rawValue.startsWith("\"") && rawValue.endsWith("\"")) {
    return rawValue
      .slice(1, -1)
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "\r")
      .replace(/\\t/g, "\t")
      .replace(/\\"/g, "\"")
      .replace(/\\\\/g, "\\");
  }

  if (rawValue.startsWith("'") && rawValue.endsWith("'")) {
    return rawValue.slice(1, -1);
  }

  const commentIndex = rawValue.indexOf(" #");
  const valueWithoutComment = commentIndex === -1 ? rawValue : rawValue.slice(0, commentIndex);
  return valueWithoutComment.trim();
}

export function readKeyFromEnvFile(filePath, key) {
  let content = "";
  try {
    content = fs.readFileSync(filePath, "utf8");
  } catch {
    return "";
  }

  const lines = content.split(/\r?\n/);
  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const line = trimmed.startsWith("export ") ? trimmed.slice("export ".length).trim() : trimmed;
    const splitIndex = line.indexOf("=");
    if (splitIndex <= 0) continue;

    const currentKey = line.slice(0, splitIndex).trim();
    if (currentKey !== key) continue;

    const rawValue = line.slice(splitIndex + 1).trim();
    return decodeEnvValue(rawValue);
  }

  return "";
}

export function resolveExaApiKey({ env = process.env, cwd = process.cwd(), projectRoot = cwd } = {}) {
  const processValue = (env.EXA_API_KEY ?? "").trim();
  if (processValue) return processValue;

  const candidates = [path.resolve(cwd, ".env"), path.resolve(projectRoot, ".env")];
  const visited = new Set();

  for (const candidate of candidates) {
    if (visited.has(candidate)) continue;
    visited.add(candidate);

    const fileValue = readKeyFromEnvFile(candidate, "EXA_API_KEY").trim();
    if (fileValue) return fileValue;
  }

  return "";
}
