import { PaymentInput } from "../models/models";

export type GatewaySelector = (args: {
    defaultUrl: string;
    fallbackUrl: string;
  }) => Promise<{ url: string; name: "default" | "fallback" }>;

export type ProcessPaymentFn = (input: PaymentInput) => Promise<void>;

export type QueueItem<T> = T & { attempts?: number };

export type CorrelationId = string;

export type MoneyCents = number; // use integers representing cents