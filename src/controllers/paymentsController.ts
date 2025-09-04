import { Router, Request, Response } from "express";
import { defaultProcessPayment } from "../services/paymentService";
import { getSummary, purgePayments } from "../repository/paymentRepository";
import { makeAsyncQueue } from "../queue/queue";

const paymentsQueue = makeAsyncQueue<{ correlationId: string; amount: number }>(50000);

export const paymentsRouter = Router();

export const registerPaymentRoutes = () => {
  const defaultUrl = process.env.PAYMENT_PROCESSOR_URL_DEFAULT || "";
  const fallbackUrl = process.env.PAYMENT_PROCESSOR_URL_FALLBACK || "";
  
  const processPayment = defaultProcessPayment({ defaultUrl, fallbackUrl });

  paymentsRouter.post("/payments", async (req: Request, res: Response) => {
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

  paymentsRouter.get("/payments-summary", async (req: Request, res: Response) => {
    const { from, to } = req.query as { from?: string; to?: string };
    
    const summary = await getSummary(
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined
    );

    return res.status(200).json(summary);
  });

  paymentsRouter.post("/purge-payments", async (_req: Request, res: Response) => {
    await purgePayments();

    return res.status(200).json({ status: "payments purged" });
  });

  // worker loop
  const MAX_PARALLELISM = parseInt(process.env.MAX_PARALLELISM || "2", 10);
  const MAX_ATTEMPTS = 5;

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

          const backoff = Math.min(1000 * Math.pow(2, attempts), 15000);

          await delay(backoff);

          await paymentsQueue.put({ ...item, attempts: attempts + 1 });
        });
      } catch (e) {
        console.error({ err: e }, `worker ${id} error`);
        await delay(100);
      }
    }
  };

  for (let i = 0; i < MAX_PARALLELISM; i++) runWorker(i);
};


