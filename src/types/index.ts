import { PROCESSOR } from "../constants";
import { IPaymentInput } from "../models/models";

export type GatewaySelector = (args: {
    defaultUrl: string;
    fallbackUrl: string;
  }) => Promise<{ url: string; name: typeof PROCESSOR.DEFAULT | typeof PROCESSOR.FALLBACK }>;

export type ProcessPaymentFn = (input: IPaymentInput) => Promise<void>;

export type QueueItem<T> = T & { attempts?: number };

export type CorrelationId = string;

export type MoneyCents = number; // use integers representing cents