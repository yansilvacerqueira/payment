import { CorrelationId, MoneyCents } from "../types";
import { PROCESSOR } from "../constants";

export interface IPaymentInput {
  correlationId: CorrelationId;
  amountCents: MoneyCents;
}

export interface IPaymentRecord {
  id: number;
  correlationId: CorrelationId;
  amountCents: MoneyCents;
  processor: typeof PROCESSOR.DEFAULT | typeof PROCESSOR.FALLBACK;
  requestedAt: Date;
}

export interface IPaymentSummary {
  default: { totalRequests: number; totalAmountCents: MoneyCents };
  fallback: { totalRequests: number; totalAmountCents: MoneyCents };
}


