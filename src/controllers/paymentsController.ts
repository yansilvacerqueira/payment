import { Router, Request, Response } from "express";
import { defaultProcessPayment } from "../services/paymentService";
import { getSummary, purgePayments } from "../repository/paymentRepository";
import { makeAsyncQueue } from "../queue/queue";
import { DEFAULTS, ROUTES, ENV } from "../constants";

const paymentsQueue = makeAsyncQueue<{ correlationId: string; amount: number }>(DEFAULTS.QUEUE_MAX_SIZE);

export const paymentsRouter = Router();

export const registerPaymentRoutes = () => {
  const defaultUrl = process.env[ENV.PAYMENT_PROCESSOR_URL_DEFAULT] || "";
  const fallbackUrl = process.env[ENV.PAYMENT_PROCESSOR_URL_FALLBACK] || "";
  
  const processPayment = defaultProcessPayment({ defaultUrl, fallbackUrl });

  paymentsRouter.post(ROUTES.PAYMENTS, async (req: Request, res: Response) => {
    const { correlationId, amount } = req.body || {};
  
    if (!correlationId || typeof correlationId !== "string") {
      return res.status(400).json({ error: "correlationId is required" });
    }
  
    if (typeof amount !== "number" || !(amount > 0)) {
      return res.status(400).json({ error: "amount must be > 0" });
    }
  
    const amountCents = Math.round(amount * 100);
    await paymentsQueue.put({ correlationId, amount: amountCents });
  
    return res.status(202).send();
  });

  paymentsRouter.get(ROUTES.PAYMENTS_SUMMARY, async (req: Request, res: Response) => {
    const { from, to } = req.query as { from?: string; to?: string };
    
    const summary = await getSummary(
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined
    );

    return res.status(200).json(summary);
  });

  paymentsRouter.post(ROUTES.PURGE_PAYMENTS, async (_req: Request, res: Response) => {
    await purgePayments();

    return res.status(200).json({ status: "payments purged" });
  });

  // worker loop
  const MAX_PARALLELISM = parseInt(process.env[ENV.MAX_PARALLELISM] || String(DEFAULTS.MAX_PARALLELISM), 10);
  const MAX_ATTEMPTS = DEFAULTS.MAX_ATTEMPTS;

  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  const runWorker = async (id: number) => {
    while (true) {
      try {
        const item = await paymentsQueue.get();
        const attempts = item.attempts ?? 0;

        const input = {
          correlationId: item.correlationId,
          amountCents: Math.round(item.amount),
        };

        processPayment(input).catch(async (e) => {
          if (attempts + 1 >= MAX_ATTEMPTS) {
            console.error({ err: e, correlationId: item.correlationId }, "permanent failure");
            return;
          }

          const backoff = Math.min(DEFAULTS.BACKOFF_BASE_MS * Math.pow(2, attempts), DEFAULTS.BACKOFF_CAP_MS);

          await delay(backoff);

          await paymentsQueue.put({ ...item, attempts: attempts + 1 });
        });
      } catch (e) {
        console.error({ err: e }, `worker ${id} error`);
        await delay(DEFAULTS.WORKER_ERROR_SLEEP_MS);
      }
    }
  };

  for (let i = 0; i < MAX_PARALLELISM; i++) runWorker(i);
};


