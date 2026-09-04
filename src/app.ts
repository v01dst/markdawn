import Fastify, { type FastifyInstance } from "fastify";
import { DEFAULT_CONFIG, type Config } from "./config.js";
import { renderRoutes } from "./routes.js";

export interface AppOptions {
  config?: Partial<Config>;
  logger?: boolean;
}

export function createApp(opts: AppOptions = {}): FastifyInstance {
  const config: Config = { ...DEFAULT_CONFIG, ...opts.config };
  const startedAt = Date.now();

  const app = Fastify({ logger: opts.logger ?? false });

  app.addContentTypeParser(
    ["text/plain", "text/markdown"],
    { parseAs: "string" },
    (_req, body, done) => {
      done(null, body);
    }
  );

  app.get("/", async () => ({
    service: "markdawn",
    version: "1.0.0",
    author: "v01dst",
    usage: {
      render: "POST /render {markdown} → {html}",
      page: "POST /page {markdown, title} → full HTML page",
    },
  }));

  app.get("/health", async () => ({
    status: "ok",
    uptimeSec: Math.floor((Date.now() - startedAt) / 1000),
  }));

  app.register((instance, _o, done) => {
    renderRoutes(instance, { maxBodyBytes: config.maxBodyBytes });
    done();
  });

  return app;
}
