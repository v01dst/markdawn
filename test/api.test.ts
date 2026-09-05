import { describe, expect, it, afterAll } from "vitest";
import { createApp } from "../src/app.js";

function build() {
  return createApp({ config: { port: 0 } });
}

describe("POST /render", () => {
  const app = build();
  afterAll(() => app.close());

  it("renders markdown from json", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/render",
      payload: { markdown: "# Hi\n\n**bold**" },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.html).toContain("<h1 id=\"hi\">Hi</h1>");
    expect(body.bytes).toBeGreaterThan(0);
  });

  it("renders markdown from raw text", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/render",
      payload: "## from raw",
      headers: { "content-type": "text/plain" },
    });
    expect(res.json().html).toMatch(/<h2 id="[^"]*">from raw<\/h2>/);
  });

  it("rejects empty markdown", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/render",
      payload: { markdown: "" },
    });
    expect(res.statusCode).toBe(400);
  });

  it("sanitizes scripts by default", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/render",
      payload: { markdown: "x <script>bad()</script>" },
    });
    expect(res.json().html).not.toContain("<script");
  });

  it("allows scripts when safe=false", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/render",
      payload: { markdown: "x <b>ok</b>", safe: false },
    });
    expect(res.statusCode).toBe(200);
  });
});

describe("POST /page", () => {
  const app = build();
  afterAll(() => app.close());

  it("returns a full html document", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/page",
      payload: { markdown: "# Title here", title: "My Page" },
    });
    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toContain("text/html");
    expect(res.body).toContain("<!doctype html>");
    expect(res.body).toContain("<title>My Page</title>");
    expect(res.body).toContain("<h1>Title here</h1>");
  });
});

describe("meta endpoints", () => {
  const app = build();
  afterAll(() => app.close());

  it("health works", async () => {
    const res = await app.inject({ url: "/health" });
    expect(res.json().status).toBe("ok");
  });

  it("root describes the service", async () => {
    const res = await app.inject({ url: "/" });
    expect(res.json().service).toBe("markdawn");
  });
});

describe("render stats", () => {
  it("includes word count and reading time", async () => {
    const words = Array(220).fill("word").join(" ");
    const res = await app.inject({
      method: "POST",
      url: "/render",
      payload: { markdown: `# Title\n\n${words}` },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.stats.words).toBe(221);
    expect(body.stats.readingTimeMin).toBe(1);
  });

  it("long documents round up", async () => {
    const words = Array(450).fill("word").join(" ");
    const res = await app.inject({
      method: "POST",
      url: "/render",
      payload: { markdown: words },
    });
    expect(res.json().stats.readingTimeMin).toBe(2);
  });
});
