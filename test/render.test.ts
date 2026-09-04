import { describe, expect, it } from "vitest";
import { renderMarkdown, renderPage } from "../src/render.js";

describe("renderMarkdown", () => {
  it("renders headings, bold and lists", () => {
    const html = renderMarkdown("# Title\n\n**bold** and _ital_\n\n- a\n- b");
    expect(html).toContain("<h1>Title</h1>");
    expect(html).toContain("<strong>bold</strong>");
    expect(html).toContain("<em>ital</em>");
    expect(html).toContain("<li>a</li>");
  });

  it("renders gfm tables", () => {
    const html = renderMarkdown("| a | b |\n|---|---|\n| 1 | 2 |");
    expect(html).toContain("<table>");
    expect(html).toContain("<td>1</td>");
  });

  it("renders gfm task lists", () => {
    const html = renderMarkdown("- [x] done\n- [ ] todo");
    expect(html).toContain('type="checkbox"');
    expect(html).toContain("checked");
  });

  it("renders fenced code with language class", () => {
    const html = renderMarkdown("```ts\nconst x = 1;\n```");
    expect(html).toContain("<pre><code");
    expect(html).toContain("const x = 1;");
  });

  it("renders autolinks", () => {
    const html = renderMarkdown("see https://example.com now");
    expect(html).toContain('<a href="https://example.com"');
  });

  it("strips script tags with content", () => {
    const html = renderMarkdown("hello <script>alert(1)</script> world");
    expect(html).not.toContain("<script");
    expect(html).not.toContain("alert(1)");
    expect(html).toContain("hello");
    expect(html).toContain("world");
  });

  it("strips self-closing dangerous tags", () => {
    const html = renderMarkdown("a <iframe src='https://evil'></iframe> b");
    expect(html).not.toContain("iframe");
    expect(html).not.toContain("evil");
  });

  it("strips event handlers", () => {
    const html = renderMarkdown('<img src="x.png" onerror="alert(1)">');
    expect(html).not.toContain("onerror");
    expect(html).toContain("x.png");
  });

  it("neutralizes javascript: urls", () => {
    const html = renderMarkdown("[click](javascript:alert(1))");
    expect(html).not.toContain("javascript:");
    expect(html).toContain('href="#"');
  });

  it("keeps safe raw html when safe mode is on", () => {
    const html = renderMarkdown("text <b>bold</b> end");
    expect(html).toContain("<b>bold</b>");
  });

  it("keeps everything in unsafe mode", () => {
    const html = renderMarkdown("x <script>1</script>", { safe: false });
    expect(html).toContain("<script>1</script>");
  });
});

describe("renderPage", () => {
  it("wraps html in a full document", () => {
    const page = renderPage("<h1>Hi</h1>", "My Doc");
    expect(page).toContain("<!doctype html>");
    expect(page).toContain("<title>My Doc</title>");
    expect(page).toContain("<h1>Hi</h1>");
  });

  it("escapes the title", () => {
    const page = renderPage("x", 'T<"e">st');
    expect(page).not.toContain('T<"e">st');
    expect(page).toContain("Test");
  });
});
