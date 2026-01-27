# Gor's Tech Blog

Personal tech blog built with Hugo (extended) and the Doks theme. Optimized for long-form technical writing, code snippets, and series-based content.

## Stack

- Hugo (extended)
- Node.js LTS
- Doks theme via Thulite CLI
- GitHub Pages (deploy on push to `main`)

## Installation

```bash
npm install
```

## Local development

```bash
npm run dev
```

Site runs at `http://localhost:1313/`.

## Build for production

```bash
npm run build
```

Outputs the static site into `public/`.

## Add a new blog page

Create a new post folder with front matter:

```bash
hugo new blog/my-post/index.md
```

Then edit the front matter fields and write your article content below.

## Migrate existing Markdown files

Place legacy markdown in `/posts` and run:

```bash
node scripts/migrate-posts.js
```

Files are copied into `content/blog/<slug>/index.md` and missing front matter is injected.

## Shortcodes

### GitHub Card

Embed a GitHub repository card in your posts:

```markdown
{{</* github repo="username/repository" */>}}
```

Example:

```markdown
{{</* github repo="gor8808/LLMValidator" */>}}
```

Renders an interactive card showing the repo's description, stars, and forks.

## Deploy to GitHub Pages

Push to `main` and GitHub Actions will build and deploy automatically.

Base URL is resolved automatically for:
- User/Org pages: `https://<user>.github.io/`
- Project pages: `https://<user>.github.io/<repo>/`

To override locally:

```bash
npm run build -- --baseURL "https://<user>.github.io/<repo>/"
```
