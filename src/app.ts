import cors from "cors";
import express, { type RequestHandler } from "express";
import helmet from "helmet";
import { env } from "./config/env.js";

export function createApp() {
  const app = express();
  const securityHeaders = (helmet as unknown as () => RequestHandler)();

  app.disable("x-powered-by");
  app.use(securityHeaders);
  app.use(
    cors({
      origin(origin, callback) {
        callback(null, !origin || origin === env.FRONTEND_URL);
      },
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "32kb" }));

  app.get("/api/v1/health", (_request, response) => {
    response.json({
      data: {
        status: "ok",
        service: "nexo-crm-api",
        timestamp: new Date().toISOString(),
      },
    });
  });

  app.use((_request, response) => {
    response.status(404).json({ error: "Ruta no encontrada" });
  });

  return app;
}

const app = createApp();
export default app;
