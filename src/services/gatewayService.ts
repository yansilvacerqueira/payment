import { request } from "undici";
import { GatewaySelector } from "../types";
import { EXTERNAL_ENDPOINTS, HTTP, PROCESSOR } from "../constants";

export const simpleSelector: GatewaySelector = async ({ defaultUrl }) => {
  return { url: defaultUrl, name: PROCESSOR.DEFAULT };
};

export const sendPayment = async (
  dest: string,
  payload: {
    correlationId: string;
    amountCents: number;
    requestedAt: Date;
  }
): Promise<boolean> => {
  const body = JSON.stringify({
    correlationId: payload.correlationId,
    amount: payload.amountCents / 100.0,
    requestedAt: payload.requestedAt.toISOString(),
  });

  try {
    const r = await request(`${dest}${EXTERNAL_ENDPOINTS.PAYMENTS}`, {
      method: "POST",
      bodyTimeout: HTTP.TIMEOUT_MS,
      headersTimeout: HTTP.TIMEOUT_MS,
      headers: {
        [HTTP.HEADERS.CONTENT_TYPE]: HTTP.CONTENT_TYPES.JSON,
        [HTTP.HEADERS.CONNECTION]: HTTP.CONNECTION.KEEP_ALIVE,
      },
      body,
    });
    return r.statusCode === 200;
  } catch {
    return false;
  }
};


