import { pgPool } from "../infra/postgres";
import { PaymentRecord, PaymentSummary } from "../models/models";

export const insertPayment = async (
  correlationId: string,
  amountCents: number,
  processor: "default" | "fallback",
  requestedAt: Date
): Promise<void> => {
  await pgPool.query(
    `insert into payments (correlation_id, amount, processor, requested_at)
     values ($1, $2::numeric / 100.0, $3, $4)
     on conflict (correlation_id) do nothing`,
    [correlationId, amountCents, processor, requestedAt.toISOString()]
  );
};

export const getSummary = async (
  from?: Date,
  to?: Date
): Promise<PaymentSummary> => {
  const rows = await pgPool.query(
    `select processor,
            count(*) as total_requests,
            coalesce(sum((amount * 100.0)::bigint), 0) as total_amount_cents
       from payments
      where ($1::timestamptz is null or requested_at >= $1)
        and ($2::timestamptz is null or requested_at <= $2)
      group by processor`,
    [from ? from.toISOString() : null, to ? to.toISOString() : null]
  );

  const summary: PaymentSummary = {
    default: { totalRequests: 0, totalAmountCents: 0 },
    fallback: { totalRequests: 0, totalAmountCents: 0 },
  };

  for (const r of rows.rows) {
    const key = r.processor as "default" | "fallback";
    summary[key].totalRequests = parseInt(r.total_requests, 10);
    summary[key].totalAmountCents = parseInt(r.total_amount_cents, 10);
  }
  return summary;
};

export const purgePayments = async (): Promise<void> => {
  await pgPool.query("truncate table payments");
};

export const getPayment = async (correlationId: string): Promise<PaymentRecord> => {
  const rows = await pgPool.query(
    `select * from payments where correlation_id = $1`,
    [correlationId]
  );
  return rows.rows[0];
};

export const updatePayment = async (correlationId: string, amountCents: number, processor: "default" | "fallback", requestedAt: Date): Promise<void> => {
  await pgPool.query(
    `update payments set amount = $2::numeric / 100.0, processor = $3, requested_at = $4 where correlation_id = $1`,
    [correlationId, amountCents, processor, requestedAt.toISOString()]
  );
  return;
};

