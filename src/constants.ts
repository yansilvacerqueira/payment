export const SERVER_HOST = process.env.HOST || "0.0.0.0";
export const SERVER_PORT = parseInt(process.env.PORT || "9999", 10);

export const JSON_BODY_LIMIT = "1mb";

export const HEALTH_PATH = "/healthz";
export const READY_PATH = "/readyz";

export const ROUTES = {
  PAYMENTS: "/payments",
  PAYMENTS_SUMMARY: "/payments-summary",
  PURGE_PAYMENTS: "/purge-payments",
} as const;

export const EXTERNAL_ENDPOINTS = {
  PAYMENTS: "/payments",
} as const;

export const ENV = {
  PAYMENT_PROCESSOR_URL_DEFAULT: "PAYMENT_PROCESSOR_URL_DEFAULT",
  PAYMENT_PROCESSOR_URL_FALLBACK: "PAYMENT_PROCESSOR_URL_FALLBACK",
  MAX_PARALLELISM: "MAX_PARALLELISM",
  POSTGRES_HOST: "POSTGRES_HOST",
  POSTGRES_PORT: "POSTGRES_PORT",
  POSTGRES_DB: "POSTGRES_DB",
  POSTGRES_USER: "POSTGRES_USER",
  POSTGRES_PASSWORD: "POSTGRES_PASSWORD",
} as const;

export const DEFAULTS = {
  MAX_PARALLELISM: 2,
  MAX_ATTEMPTS: 5,
  BACKOFF_BASE_MS: 1000,
  BACKOFF_CAP_MS: 15000,
  WORKER_ERROR_SLEEP_MS: 100,
  QUEUE_MAX_SIZE: 50000,
} as const;

export const REDIS = {
  SOCKET_PATH: "/var/run/redis/redis.sock",
  TLS: false,
} as const;

export const HTTP = {
  TIMEOUT_MS: 10_000,
  HEADERS: {
    CONTENT_TYPE: "Content-Type",
    CONNECTION: "Connection",
  },
  CONTENT_TYPES: {
    JSON: "application/json",
  },
  CONNECTION: {
    KEEP_ALIVE: "keep-alive",
  },
} as const;

export const PROCESSOR = {
  DEFAULT: "default" as const,
  FALLBACK: "fallback" as const,
} as const;

export const TABLES = {
  PAYMENTS: "payments",
} as const;


