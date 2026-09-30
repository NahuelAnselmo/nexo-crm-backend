import "dotenv/config";
import app from "./app.js";
import { env } from "./config/env.js";

if (!process.env.VERCEL) {
  app.listen(env.PORT, () => {
    console.log(`Nexo CRM API disponible en http://localhost:${env.PORT}`);
  });
}

export default app;
