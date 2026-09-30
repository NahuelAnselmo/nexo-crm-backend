import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../app.js";
import { prisma } from "../lib/prisma.js";

const app = createApp();

beforeEach(async () => {
  await prisma.session.deleteMany();
});

describe("autenticación y dashboard", () => {
  it("inicia sesión y limita el dashboard a la organización del usuario", async () => {
    const agent = request.agent(app);
    const login = await agent
      .post("/api/v1/auth/login")
      .set("Origin", "http://localhost:3000")
      .send({ email: "admin@nexocrm.demo", password: "Demo1234!" })
      .expect(200);

    expect(login.headers["set-cookie"]?.[0]).toContain("HttpOnly");
    expect(login.body.data.membership).toMatchObject({
      role: "OWNER",
      organization: { id: "org_nexo_demo", slug: "nexo-agency" },
    });

    const dashboard = await agent.get("/api/v1/dashboard").expect(200);
    expect(dashboard.body.data.metrics).toMatchObject({
      openPipelineInCents: 1848000000,
      openOpportunities: 10,
      pendingActivities: 3,
    });
    expect(dashboard.body.data.stages).toHaveLength(4);
    expect(dashboard.body.data.contacts).toHaveLength(8);
    expect(
      dashboard.body.data.stages.every(
        (stage: { organizationId: string }) =>
          stage.organizationId === "org_nexo_demo",
      ),
    ).toBe(true);
  });

  it("rechaza credenciales incorrectas y dashboard sin sesión", async () => {
    await request(app)
      .post("/api/v1/auth/login")
      .set("Origin", "http://localhost:3000")
      .send({ email: "admin@nexocrm.demo", password: "Incorrecta123!" })
      .expect(401);
    await request(app).get("/api/v1/dashboard").expect(401);
  });

  it("bloquea un login enviado desde otro origen", async () => {
    const response = await request(app)
      .post("/api/v1/auth/login")
      .set("Origin", "https://example.com")
      .send({ email: "admin@nexocrm.demo", password: "Demo1234!" })
      .expect(403);
    expect(response.body).toEqual({
      error: "Origen de solicitud no autorizado",
    });
  });

  it("cierra la sesión e invalida la cookie", async () => {
    const agent = request.agent(app);
    await agent
      .post("/api/v1/auth/login")
      .set("Origin", "http://localhost:3000")
      .send({ email: "admin@nexocrm.demo", password: "Demo1234!" })
      .expect(200);
    await agent
      .post("/api/v1/auth/logout")
      .set("Origin", "http://localhost:3000")
      .expect(204);
    await agent.get("/api/v1/auth/me").expect(401);
  });
});
