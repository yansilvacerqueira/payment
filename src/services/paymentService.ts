import { insertPayment } from "../repository/paymentRepository";
import { IPaymentInput } from "../models/models";
import { sendPayment, simpleSelector } from "./gatewayService";
import { GatewaySelector, ProcessPaymentFn } from "../types";

export const makeProcessPayment = (
  selectGateway: GatewaySelector,
  urls: { defaultUrl: string; fallbackUrl: string }
): ProcessPaymentFn => {
  return async (input: IPaymentInput) => {
    const { url, name } = await selectGateway(urls);
    
    const requestedAt = new Date();
    
    const ok = await sendPayment(url, {
      correlationId: input.correlationId,
      amountCents: input.amountCents,
      requestedAt,
    });
    
    if (!ok) throw new Error("Payment send failed");

    await insertPayment(input.correlationId, input.amountCents, name, requestedAt);
  };
};

export const defaultProcessPayment = (urls: {
  defaultUrl: string;
  fallbackUrl: string;
}): ProcessPaymentFn => makeProcessPayment(simpleSelector, urls);


