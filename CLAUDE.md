# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is Gor's Tech Blog - a technical blog built with Hugo (extended) using the Doks theme. The blog focuses on .NET, System Design, and practical LLM integration.

## Build Commands

```bash
npm install          # Install dependencies (requires Node 20.11.0+)
npm run dev          # Local development server at http://localhost:1313/
npm run build        # Production build with minification
npm run format       # Format all files with Prettier
npm run preview      # Preview production build
```

## Creating Content

```bash
hugo new blog/my-post/index.md    # Create a new blog post
```

Posts use the archetype at `archetypes/blog.md` with front matter including title, description, categories, tags, series, and SEO fields.

## Architecture

- **Hugo Configuration**: Lives in `config/` directory with subdirectories for `_default/`, `production/`, and `next/` environments. All config files use TOML format.
- **Theme**: Uses `@thulite/doks-core` with custom overrides in `layouts/` (e.g., custom `home.html`)
- **Content**: Blog posts in `content/blog/`, homepage at `content/_index.md`
- **Assets**: SCSS in `assets/scss/`, JavaScript in `assets/js/`, images in `assets/images/`
- **Icons**: Tabler Icons mounted to `assets/svgs/tabler-icons`

## Key Configuration Files

- `config/_default/hugo.toml` - Main Hugo settings (site title, language, RSS)
- `config/_default/params.toml` - Theme parameters, social links, author info, SEO
- `config/_default/markup.toml` - Goldmark markdown settings, code highlighting (Monokai)
- `config/_default/module.toml` - Hugo module mounts for theme dependencies

## Deployment

Automated via GitHub Actions (`.github/workflows/gh-pages.yml`). Push to main branch triggers build and deploy to GitHub Pages. The workflow auto-resolves base URL for user/org pages vs project pages.

## Requirements

- **Hugo Extended**: v0.136.5+ (standard Hugo won't work)
- **Node.js**: v20.11.0+
