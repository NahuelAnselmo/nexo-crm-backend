import cors from "cors";
import express, { type RequestHandler } from "express";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { env } from "./config/env.js";
import { authRouter } from "./routes/auth.js";
import { dashboardRouter } from "./routes/dashboard.js";

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

  app.use(
    "/api/v1/auth/login",
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 10,
      standardHeaders: "draft-8",
      legacyHeaders: false,
    }),
  );
  app.use(["/api/v1/auth", "/api/v1/dashboard"], (request, response, next) => {
    if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return next();
    const origin = request.get("origin");
    if (origin === env.FRONTEND_URL || (!origin && env.NODE_ENV === "test"))
      return next();
    return response
      .status(403)
      .json({ error: "Origen de solicitud no autorizado" });
  });

  app.get("/api/v1/health", (_request, response) => {
    response.json({
      data: {
        status: "ok",
        service: "nexo-crm-api",
        timestamp: new Date().toISOString(),
      },
    });
  });

  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/dashboard", dashboardRouter);

  app.use((_request, response) => {
    response.status(404).json({ error: "Ruta no encontrada" });
  });

  return app;
}

const app = createApp();
export default app;
