export interface Config {
  port: number;
  host: string;
  maxBodyBytes: number;
}

function intEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const value = Number.parseInt(raw, 10);
  return Number.isFinite(value) ? value : fallback;
}

export const DEFAULT_CONFIG: Config = {
  port: 3000,
  host: "0.0.0.0",
  maxBodyBytes: 512 * 1024,
};

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  return {
    port: intEnv("PORT", DEFAULT_CONFIG.port),
    host: env.HOST ?? DEFAULT_CONFIG.host,
    maxBodyBytes: intEnv("MAX_BODY_BYTES", DEFAULT_CONFIG.maxBodyBytes),
  };
}
