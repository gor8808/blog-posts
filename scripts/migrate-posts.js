#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const projectRoot = process.cwd();
const sourceDir = path.join(projectRoot, "posts");
const destRoot = path.join(projectRoot, "content", "blog");

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkDir(fullPath));
    } else if (/\.md|\.markdown$/i.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

function titleCase(input) {
  return input.replace(/\b\w/g, (char) => char.toUpperCase());
}

function slugify(input) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-");
}

function extractDateFromFilename(name) {
  const match = name.match(/^(\d{4})-(\d{2})-(\d{2})[-_]/);
  if (!match) return null;
  const [_, year, month, day] = match;
  return new Date(`${year}-${month}-${day}T09:00:00Z`);
}

function cleanContentForDescription(content) {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith("#") && !line.startsWith("---"));
  if (!lines.length) return "";
  const first = lines[0].replace(/[`*_>#-]/g, "").trim();
  return first.length > 160 ? `${first.slice(0, 157)}...` : first;
}

function ensureFrontMatter(rawContent, fallback) {
  const fmRegex = /^---\n([\s\S]*?)\n---\n?/;
  const match = rawContent.match(fmRegex);
  if (!match) {
    const frontMatter = [
      "---",
      `title: \"${fallback.title}\"`,
      `date: ${fallback.date}`,
      `description: \"${fallback.description}\"`,
      `tags: ${JSON.stringify(fallback.tags)}`,
      "draft: false",
      "categories: []",
      "series: []",
      "contributors: []",
      "images: []",
      "canonicalURL: \"\"",
      "toc: true",
      "---",
      "",
    ].join("\n");
    return frontMatter + rawContent.trimStart();
  }

  let fmBody = match[1];
  const additions = [];
  if (!/^\s*title:\s*/m.test(fmBody)) additions.push(`title: \"${fallback.title}\"`);
  if (!/^\s*date:\s*/m.test(fmBody)) additions.push(`date: ${fallback.date}`);
  if (!/^\s*description:\s*/m.test(fmBody)) additions.push(`description: \"${fallback.description}\"`);
  if (!/^\s*tags:\s*/m.test(fmBody)) additions.push(`tags: ${JSON.stringify(fallback.tags)}`);
  if (!/^\s*contributors:\s*/m.test(fmBody)) additions.push("contributors: []");
  if (additions.length) {
    fmBody = `${fmBody.trim()}\n${additions.join("\n")}`;
  }
  const rebuilt = `---\n${fmBody}\n---\n`;
  return rebuilt + rawContent.slice(match[0].length);
}

function migrateFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const relative = path.relative(sourceDir, filePath);
  const relativeDir = path.dirname(relative);
  const baseName = path.basename(filePath, path.extname(filePath));

  const dateFromName = extractDateFromFilename(baseName);
  const stats = fs.statSync(filePath);
  const date = (dateFromName || stats.birthtime || stats.mtime || new Date()).toISOString();

  const nameWithoutDate = baseName.replace(/^\d{4}-\d{2}-\d{2}[-_]/, "");
  const title = titleCase(nameWithoutDate.replace(/[-_]/g, " "));
  const description = cleanContentForDescription(raw);

  const tags = relativeDir === "."
    ? []
    : relativeDir.split(path.sep).map((segment) => segment.replace(/[-_]/g, " "));

  const slug = slugify(nameWithoutDate || baseName);
  const destDir = path.join(destRoot, slug);
  const destPath = path.join(destDir, "index.md");

  const contentWithFrontMatter = ensureFrontMatter(raw, {
    title,
    date,
    description,
    tags,
  });

  fs.mkdirSync(destDir, { recursive: true });
  fs.writeFileSync(destPath, contentWithFrontMatter, "utf8");

  console.log(`Migrated: ${relative} -> content/blog/${slug}/index.md`);
}

if (!fs.existsSync(sourceDir)) {
  console.error(`Source folder not found: ${sourceDir}`);
  process.exit(1);
}

const files = walkDir(sourceDir);
if (!files.length) {
  console.log("No markdown files found in /posts.");
  process.exit(0);
}

files.forEach(migrateFile);
