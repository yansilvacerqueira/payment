import { Pool } from "pg";

const {
  POSTGRES_HOST = "postgres",
  POSTGRES_PORT = "5432",
  POSTGRES_DB = "payments",
  POSTGRES_USER = "postgres",
  POSTGRES_PASSWORD = "postgres",
} = process.env;

export const pgPool = new Pool({
  host: POSTGRES_HOST,
  port: parseInt(POSTGRES_PORT, 10),
  database: POSTGRES_DB,
  user: POSTGRES_USER,
  password: POSTGRES_PASSWORD,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export const initPostgres = async (): Promise<void> => {
  const client = await pgPool.connect();
  try {
    await client.query(`
      create table if not exists payments (
        id bigserial primary key,
        correlation_id text unique not null,
        amount numeric(18,2) not null,
        processor text not null,
        requested_at timestamptz not null
      );
    `);
  } finally {
    client.release();
  }
};


