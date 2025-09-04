import { CorrelationId, MoneyCents } from "../types";

export interface PaymentInput {
  correlationId: CorrelationId;
  amountCents: MoneyCents;
}

export interface PaymentRecord {
  id: number;
  correlationId: CorrelationId;
  amountCents: MoneyCents;
  processor: "default" | "fallback";
  requestedAt: Date;
}

export interface PaymentSummary {
  default: { totalRequests: number; totalAmountCents: MoneyCents };
  fallback: { totalRequests: number; totalAmountCents: MoneyCents };
}


