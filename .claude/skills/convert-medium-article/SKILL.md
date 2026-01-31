---
name: convert-medium-article
description: Use when user provides a Medium article markdown export file and wants to convert it to a Hugo blog post with downloaded images and proper formatting
---

# Convert Medium Article to Hugo Blog Post

## Overview

Automates conversion of Medium markdown exports to Hugo blog posts, including image downloads, front matter generation, and content cleanup.

## When to Use

Use when:
- User provides a Medium article markdown file path
- Article needs to be converted to Hugo format
- Images from Medium CDN need to be downloaded locally
- Front matter needs to be created from article metadata

## Quick Reference

| Step | Action |
|------|--------|
| 1. Read | Read the Medium markdown file |
| 2. Create | Run `hugo new blog/slug/index.md` |
| 3. Download | Download all images from miro.medium.com URLs |
| 4. Convert | Write Hugo-formatted content with front matter |
| 5. Clean | Remove Medium-specific links and formatting |

## Implementation

### Step 1: Read the Medium Export

```
Read /path/to/medium.md
```

### Step 2: Extract Article Metadata

From the Medium markdown, extract:
- **Title**: First H1 heading (after cleaning)
- **Date**: Publication date if present
- **Images**: All URLs matching `https://miro.medium.com/*`
- **Content**: Everything after author/metadata lines

### Step 3: Create Hugo Post Structure

```bash
# Create slug from title (lowercase, hyphens, no special chars)
hugo new blog/{slug}/index.md
```

### Step 4: Download Images in Parallel

Download all images to the post directory:

```bash
# Use curl in parallel for each image
# IMPORTANT: Always save as .webp format for optimal performance
curl -o "/path/to/blog/{slug}/image-name.webp" "https://miro.medium.com/..."
```

**Image naming convention:**
- Use descriptive names from context
- **CRITICAL: Always use .webp format** (not .jpeg or .png)
- Use lowercase with hyphens
- Convert to WebP even if source is PNG/JPEG

### Step 5: Generate Front Matter

Create Hugo front matter with:

```yaml
---
title: "Article Title"
date: YYYY-MM-DDTHH:MM:SSZ
description: "Concise 1-2 sentence description"
summary: "Longer summary (2-3 sentences) for search and preview"
draft: false
categories: ["Category1", "Category2"]
tags: ["tag1", "tag2", "tag3"]
series: []
contributors: []
images: ["featured-image.webp"]
canonicalURL: ""
toc: true
pinned: false
seo:
  title: "SEO-optimized title variant"
  description: "SEO description (155 chars max)"
  canonical: ""
  noindex: false
---
```

**Category/Tag Guidelines:**
- Categories: Broad topics (System Design, Databases, .NET)
- Tags: Specific technologies/concepts (UUID, PostgreSQL, Microservices)
- 2-3 categories max, 5-8 tags max

### Step 6: Clean Medium-Specific Content

Remove or transform:
- Author profile links and images
- Medium navigation elements ("Listen", "Share")
- `[nameless link]` entries
- Clapping/bookmarking links
- Medium-specific formatting

Keep:
- All article content
- Code blocks (convert to proper syntax highlighting)
- External reference links
- Image captions

### Step 7: Update Image References

Replace Medium URLs with Hugo img-caption shortcode (always use .webp extension):

```markdown
# Before (Medium URL)
![Alt text](https://miro.medium.com/v2/resize:fit:1400/format:webp/0*abc123.png)

# After (Hugo shortcode)
{{< img-caption src="image-name.webp" caption="Alt text describing the image" link="optional-source-url" >}}
```

**Image shortcode format:**
- `src`: Filename (always .webp)
- `caption`: Descriptive caption from original alt text or context
- `link`: Optional - add if image references external source/article

**When to include link parameter:**
- Image from external source that should be credited
- Image references a paper, article, or website
- Omit if no external source to link to

### Step 8: Run SEO optimization

1. Run skill `/marketing-skills:seo-audit` for created artcile
2. Create a todo list of all reported items from that skill
3. Resolve them one by one


## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Images not downloaded | Check all `miro.medium.com` URLs in parallel |
| Images saved as PNG/JPEG | **Always convert to .webp format** |
| Using markdown image syntax | Use `{{< img-caption >}}` shortcode instead |
| Missing image captions | Extract from alt text or context |
| Missing front matter fields | Use complete template above |
| Draft status left as true | Set `draft: false` for published articles |
| Medium links left in | Remove author, clap, bookmark links |
| Poor image names | Use descriptive names, not hash codes |
| Broken local image paths | Use relative paths, not absolute |
| Missing SEO fields | Fill in description and title variants |
| Inconsistent image formats | All images must be .webp (check with ls) |

## Example Workflow

```markdown
User: "Convert this Medium article at /Downloads/medium (1).md"

1. Read /Downloads/medium (1).md
2. Extract title: "How to Effectively Manage Unique Identifiers at Scale"
3. Create slug: "unique-identifiers-at-scale"
4. Run: hugo new blog/unique-identifiers-at-scale/index.md
5. Find 10 images from miro.medium.com
6. Download in parallel as .webp to blog/unique-identifiers-at-scale/
7. Write content with proper front matter
8. Clean Medium-specific elements
9. Replace images with {{< img-caption >}} shortcode format
10. Run SEO audit and implement fixes
```

## Post-Conversion Checklist

- [ ] All images downloaded successfully
- [ ] **All images in .webp format** (not .png or .jpeg)
- [ ] Images use `{{< img-caption >}}` shortcode (not markdown `![]()`)
- [ ] All img-caption shortcodes have descriptive captions
- [ ] External source images include link parameter
- [ ] Front matter complete with categories/tags
- [ ] Medium-specific content removed
- [ ] Code blocks have proper syntax highlighting
- [ ] External links still functional
- [ ] Draft status set correctly
- [ ] SEO fields filled in

## Related Commands

```bash
# Preview the converted post
npm run dev

# Build for production
npm run build

# Format all files
npm run format
```
