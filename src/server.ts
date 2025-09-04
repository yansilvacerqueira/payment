import express,{ json } from "express";
import cors from "cors";
import { paymentsRouter, registerPaymentRoutes } from "./controllers/paymentsController";
import { initPostgres } from "./infra/postgres";
import { HEALTH_PATH, READY_PATH, JSON_BODY_LIMIT, SERVER_HOST, SERVER_PORT } from "./constants";

export const buildServer = async () => {
  const app = express();
  
  app.use(cors());
  app.use(json({ limit: JSON_BODY_LIMIT }));
  app.disable("x-powered-by");

  // healthz and readyz endpoints are used by the load balancer to check if the server is ready to serve traffic
  app.get(HEALTH_PATH, (_req, res) => res.json({ status: "ok" }));
  app.get(READY_PATH, (_req, res) => res.json({ status: "ready" }));

  registerPaymentRoutes();
  app.use(paymentsRouter);

  await initPostgres();
  return app;
};

buildServer()
  .then((app) => {
    app.listen(SERVER_PORT, SERVER_HOST, () => {
      console.log(`Server listening on ${SERVER_HOST}:${SERVER_PORT}`);
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });


