import type { FastifyInstance } from "fastify";
import { renderMarkdown, renderPage, renderWithToc } from "./render.js";

export interface RenderRoutesOpts {
  maxBodyBytes: number;
}

export function renderRoutes(app: FastifyInstance, opts: RenderRoutesOpts): void {
  const errorResponse = {
    type: "object",
    properties: { error: { type: "string" } },
    required: ["error"],
  } as const;

  app.post(
    "/render",
    {
      config: { rawBody: true },
      schema: {
        response: {
          200: {
            type: "object",
            properties: {
              html: { type: "string" },
              bytes: { type: "number" },
            },
            required: ["html", "bytes"],
          },
          400: errorResponse,
        },
      },
    },
    async (request, reply) => {
      const ct = request.headers["content-type"] ?? "";
      let md: string;
      let safe = true;
      let title = "document";

      if (ct.includes("application/json")) {
        const body = request.body as {
          markdown?: string;
          safe?: boolean;
          title?: string;
        };
        md = body.markdown ?? "";
        safe = body.safe !== false;
        title = body.title ?? title;
      } else {
        md = (request.body as string) ?? "";
      }

      if (md.length === 0) {
        return reply.status(400).send({ error: "markdown body must not be empty" });
      }
      if (Buffer.byteLength(md, "utf8") > opts.maxBodyBytes) {
        return reply
          .status(400)
          .send({ error: `markdown too large (max ${opts.maxBodyBytes} bytes)` });
      }

      const { html, toc } = renderWithToc(md, { safe });
      const words = md.split(/\s+/).filter(Boolean).length;
      return reply.status(200).send({
        html,
        toc,
        bytes: Buffer.byteLength(html, "utf8"),
        stats: {
          words,
          readingTimeMin: Math.max(1, Math.round(words / 220)),
        },
      });
    }
  );

  app.post(
    "/page",
    {
      config: { rawBody: true },
      schema: {
        response: {
          200: { type: "string" },
          400: errorResponse,
        },
      },
    },
    async (request, reply) => {
      const ct = request.headers["content-type"] ?? "";
      let md: string;
      let title = "document";

      if (ct.includes("application/json")) {
        const body = request.body as { markdown?: string; title?: string };
        md = body.markdown ?? "";
        title = body.title ?? title;
      } else {
        md = (request.body as string) ?? "";
      }

      if (md.length === 0) {
        return reply.status(400).send({ error: "markdown body must not be empty" });
      }

      const html = renderMarkdown(md, { safe: true });
      return reply
        .header("content-type", "text/html; charset=utf-8")
        .send(renderPage(html, title));
    }
  );
}
