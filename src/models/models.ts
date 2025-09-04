import { CorrelationId, MoneyCents } from "../types";
import { PROCESSOR } from "../constants";

export interface PaymentInput {
  correlationId: CorrelationId;
  amountCents: MoneyCents;
}

export interface PaymentRecord {
  id: number;
  correlationId: CorrelationId;
  amountCents: MoneyCents;
  processor: typeof PROCESSOR.DEFAULT | typeof PROCESSOR.FALLBACK;
  requestedAt: Date;
}

export interface PaymentSummary {
  default: { totalRequests: number; totalAmountCents: MoneyCents };
  fallback: { totalRequests: number; totalAmountCents: MoneyCents };
}


