import express,{ json } from "express";
import cors from "cors";
import { paymentsRouter, registerPaymentRoutes } from "./controllers/paymentsController";
import { initPostgres } from "./infra/postgres";

export const buildServer = async () => {
  const app = express();
  
  app.use(cors());
  app.use(json({ limit: "1mb" }));
  app.disable("x-powered-by");

  // healthz and readyz endpoints are used by the load balancer to check if the server is ready to serve traffic
  app.get("/healthz", (_req, res) => res.json({ status: "ok" }));
  app.get("/readyz", (_req, res) => res.json({ status: "ready" }));

  registerPaymentRoutes();
  app.use(paymentsRouter);

  await initPostgres();
  return app;
};

buildServer()
  .then((app) => {
    app.listen(9999, "0.0.0.0", () => {
      console.log("Server listening on 0.0.0.0:9999");
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });


