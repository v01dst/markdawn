<div align="center">

# 🌅 markdawn

**Markdown → HTML rendering API. GFM in, beautiful sanitized HTML out.**

[![CI](https://github.com/v01dst/markdawn/actions/workflows/ci.yml/badge.svg)](https://github.com/v01dst/markdawn/actions/workflows/ci.yml)
![License](https://img.shields.io/badge/license-MIT-8A2BE2)
![Node](https://img.shields.io/badge/node-22-339933?logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-strict-3178C6?logo=typescript&logoColor=white)
![Tests](https://img.shields.io/badge/tests-21%20passing-brightgreen)

`gfm tables` · `task lists` · `xss-safe` · `full-page mode` · `no browser needed`
</div>

---

## ✨ Features

- **📝 Full GFM** — tables, task lists, autolinks, strikethrough, fenced code
- **🛡️ Sanitized by default** — scripts/iframes stripped, event handlers removed, `javascript:` URLs neutralized (opt out with `safe: false`)
- **📄 Two modes** — fragment HTML (`/render`) or complete styled page (`/page`)
- **🌗 Dark-mode aware** — `/page` output adapts to the reader's color scheme
- **🧼 Safe raw HTML** — `<b>`, `<em>` etc. pass through; dangerous tags don't
- **🐳 One-command deploy** — slim Docker image with healthcheck

## 🚀 Quick Start

```bash
git clone https://github.com/v01dst/markdawn
cd markdawn
npm ci
npm start
```

Or with Docker:

```bash
docker compose up -d
```

## 📡 API

| Method | Route     | Body                          | Returns            |
|--------|-----------|-------------------------------|--------------------|
| `POST` | `/render` | `{markdown, safe?, title?}` or raw text | `{html, bytes}` |
| `POST` | `/page`   | `{markdown, title?}`          | full HTML document |
| `GET`  | `/health` | —                             | liveness           |

### Render a fragment

```bash
curl -X POST http://localhost:3000/render \
  -H 'content-type: application/json' \
  -d '{"markdown": "# Hi\n\n**bold** and a [link](https://x.com)"}'
```

```json
{ "html": "<h1>Hi</h1>\n<p><strong>bold</strong> and a <a href=\"https://x.com\">link</a></p>\n", "bytes": 74 }
```

### Render a full page

```bash
curl -X POST http://localhost:3000/page \
  -H 'content-type: application/json' \
  -d '{"markdown": "# Release notes", "title": "v2.0"}' -o page.html
```

### Safety example

```
input:  "hello <script>alert(1)</script> <b>world</b>"
output: "<p>hello  <b>world</b></p>"
```

### Errors

| Status | Meaning                          |
|--------|----------------------------------|
| `400`  | Empty or oversized markdown      |

## ⚙️ Configuration

| Variable         | Default   | Description           |
|------------------|-----------|-----------------------|
| `PORT`           | `3000`    | Listen port           |
| `MAX_BODY_BYTES` | `524288`  | Max markdown size     |

## 🧱 Tech Stack

| Layer     | Tech                |
|-----------|---------------------|
| Runtime   | Node.js 22          |
| Language  | TypeScript (strict) |
| Framework | Fastify 5           |
| Markdown  | marked              |
| Testing   | Vitest 5            |
| Packaging | Docker + compose    |
| CI        | GitHub Actions      |

---

<div align="center">

Built with ⚡ by **v01dst**

[![GitHub](https://img.shields.io/badge/github-v01dst-181717?logo=github)](https://github.com/v01dst)
[![Discord](https://img.shields.io/badge/discord-9p.1-5865F2?logo=discord&logoColor=white)](https://discord.com/users/9p.1)

</div>
