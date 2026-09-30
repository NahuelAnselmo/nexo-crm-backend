import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "./app.js";

const app = createApp();

describe("API base", () => {
  it("expone su estado sin revelar la tecnología del servidor", async () => {
    const response = await request(app).get("/api/v1/health").expect(200);

    expect(response.body.data).toMatchObject({
      status: "ok",
      service: "nexo-crm-api",
    });
    expect(response.headers["x-powered-by"]).toBeUndefined();
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
  });

  it("autoriza únicamente el frontend configurado", async () => {
    const allowed = await request(app)
      .get("/api/v1/health")
      .set("Origin", "http://localhost:3000")
      .expect(200);
    const rejected = await request(app)
      .get("/api/v1/health")
      .set("Origin", "https://example.com")
      .expect(200);

    expect(allowed.headers["access-control-allow-origin"]).toBe(
      "http://localhost:3000",
    );
    expect(rejected.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("responde 404 con un contrato JSON", async () => {
    const response = await request(app).get("/api/v1/no-existe").expect(404);
    expect(response.body).toEqual({ error: "Ruta no encontrada" });
  });
});
