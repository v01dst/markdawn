import { marked, Renderer } from "marked";

const BLOCKED_TAGS = new Set([
  "script", "iframe", "object", "embed", "form", "link", "meta", "base",
]);

/**
 * Render markdown to HTML with GitHub-flavored markdown.
 * Raw HTML is passed through only for a safe subset: dangerous tags
 * (script, iframe, object, embed, form, link, meta, base) and all
 * event handler attributes are stripped.
 */
export function renderMarkdown(md: string, opts: { safe?: boolean } = {}): string {
  const safe = opts.safe ?? true;

  marked.setOptions({ gfm: true, breaks: false });

  if (!safe) {
    return marked.parse(md, { async: false }) as string;
  }

  let html = marked.parse(md, { async: false }) as string;

  // Drop entire dangerous elements (opening tag through closing tag).
  for (const tag of BLOCKED_TAGS) {
    const pattern = new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}\\s*>`, "gi");
    html = html.replace(pattern, "");
    const selfClosing = new RegExp(`<${tag}\\b[^>]*/?>`, "gi");
    html = html.replace(selfClosing, "");
  }

  // Strip event handler attributes (onclick=, onerror=, …).
  html = html.replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");

  // Neutralize javascript: URLs in href/src.
  html = html.replace(
    /\s(href|src)\s*=\s*("|')\s*javascript:[^"']*\2/gi,
    ' $1="#"'
  );

  return html;
}

/** Wrap rendered HTML in a minimal dark-themed document. */
export function renderPage(html: string, title: string): string {
  const safeTitle = title.replace(/[<>&"]/g, "");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${safeTitle}</title>
<style>
  :root { color-scheme: light dark; }
  body { max-width: 760px; margin: 0 auto; padding: 32px 20px; font-family: -apple-system, "Segoe UI", Roboto, sans-serif; line-height: 1.65; color: #1f2328; }
  pre { background: #f6f8fa; padding: 14px; border-radius: 8px; overflow-x: auto; }
  code { background: #f6f8fa; padding: 2px 6px; border-radius: 4px; font-size: 0.92em; }
  pre code { padding: 0; background: none; }
  blockquote { border-left: 4px solid #d0d7de; margin: 0; padding: 0 16px; color: #656d76; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #d0d7de; padding: 8px 12px; text-align: left; }
  img { max-width: 100%; }
  h1, h2 { border-bottom: 1px solid #d8dee4; padding-bottom: 8px; }
  @media (prefers-color-scheme: dark) {
    body { background: #0d1117; color: #e6edf3; }
    pre, code { background: #161b22; }
    blockquote { border-color: #30363d; color: #8b949e; }
    th, td { border-color: #30363d; }
    h1, h2 { border-color: #21262d; }
  }
</style>
</head>
<body>
${html}
</body>
</html>`;
}

export interface TocEntry {
  level: number;
  text: string;
  id: string;
}

/** Slugify a heading text for anchor ids. */
function headingId(text: string): string {
  return text
    .replace(/&amp;/g, "")
    .replace(/&lt;/g, "")
    .replace(/&gt;/g, "")
    .replace(/&quot;/g, "")
    .replace(/&#39;/g, "")
    .replace(/&[a-z]+;/gi, "")
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Render markdown, adding id anchors to h1-h4 headings and returning
 * a table of contents.
 */
export function renderWithToc(
  md: string,
  opts: { safe?: boolean } = {}
): { html: string; toc: TocEntry[] } {
  const html = renderMarkdown(md, opts);
  const toc: TocEntry[] = [];
  const seen = new Map<string, number>();

  const withAnchors = html.replace(
    /<h([1-4])>(.*?)<\/h\1>/g,
    (_match, levelStr: string, inner: string) => {
      const level = Number(levelStr);
      const text = inner.replace(/<[^>]+>/g, "");
      let id = headingId(text);
      if (!id) id = `section-${toc.length + 1}`;
      const count = seen.get(id) ?? 0;
      seen.set(id, count + 1);
      if (count > 0) id = `${id}-${count}`;
      toc.push({ level, text, id });
      return `<h${level} id="${id}">${inner}</h${level}>`;
    }
  );

  return { html: withAnchors, toc };
}
