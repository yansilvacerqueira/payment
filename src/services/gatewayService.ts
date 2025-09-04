import { request } from "undici";

export type GatewaySelector = (args: {
  defaultUrl: string;
  fallbackUrl: string;
}) => Promise<{ url: string; name: "default" | "fallback" }>;

export const simpleSelector: GatewaySelector = async ({ defaultUrl }) => {
  return { url: defaultUrl, name: "default" };
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
    const r = await request(`${dest}/payments`, {
      method: "POST",
      bodyTimeout: 10_000,
      headersTimeout: 10_000,
      headers: {
        "Content-Type": "application/json",
        Connection: "keep-alive",
      },
      body,
    });
    return r.statusCode === 200;
  } catch {
    return false;
  }
};


