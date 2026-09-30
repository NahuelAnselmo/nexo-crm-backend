import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { hashPassword } from "../src/auth/password.js";

if (
  process.env.NODE_ENV === "production" &&
  process.env.ALLOW_DEMO_SEED !== "true"
) {
  throw new Error("El seed ficticio está bloqueado en producción");
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL es obligatoria");

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});
const now = new Date();
const hoursFromNow = (hours: number) =>
  new Date(now.getTime() + hours * 3_600_000);
const daysFromNow = (days: number) =>
  new Date(now.getTime() + days * 86_400_000);

async function main() {
  await prisma.organization.deleteMany({ where: { slug: "nexo-agency" } });
  await prisma.user.deleteMany({ where: { email: "admin@nexocrm.demo" } });

  await prisma.organization.create({
    data: {
      id: "org_nexo_demo",
      name: "Nexo Agency",
      slug: "nexo-agency",
      pipelineStages: {
        create: [
          {
            id: "stage-new",
            name: "Nuevo contacto",
            color: "#7a8bff",
            position: 1,
          },
          {
            id: "stage-qualified",
            name: "Calificado",
            color: "#47a8bd",
            position: 2,
          },
          {
            id: "stage-proposal",
            name: "Propuesta enviada",
            color: "#e6a64c",
            position: 3,
          },
          {
            id: "stage-negotiation",
            name: "Negociación",
            color: "#9a67d7",
            position: 4,
          },
        ],
      },
      tags: {
        create: [
          { id: "tag-priority", name: "Prioridad", color: "#d06156" },
          { id: "tag-referral", name: "Referido", color: "#6758d9" },
          { id: "tag-inbound", name: "Inbound", color: "#299a68" },
        ],
      },
    },
  });

  const owner = await prisma.user.create({
    data: {
      id: "user_demo_owner",
      name: "Nahuel Anselmo",
      email: "admin@nexocrm.demo",
      passwordHash: await hashPassword("Demo1234!"),
      memberships: {
        create: { organizationId: "org_nexo_demo", role: "OWNER" },
      },
    },
  });

  await prisma.contact.createMany({
    data: [
      {
        id: "contact-lucia",
        firstName: "Lucía",
        lastName: "Medina",
        email: "lucia@surcafe.demo",
        phone: "+54 11 5555-1101",
        company: "Sur Café",
        jobTitle: "Directora comercial",
        source: "Referido",
        organizationId: "org_nexo_demo",
        assignedToId: owner.id,
      },
      {
        id: "contact-agustin",
        firstName: "Agustín",
        lastName: "Vera",
        email: "agustin@deltainsumos.demo",
        phone: "+54 11 5555-1102",
        company: "Delta Insumos",
        jobTitle: "Gerente de operaciones",
        source: "Web",
        organizationId: "org_nexo_demo",
        assignedToId: owner.id,
      },
      {
        id: "contact-martina",
        firstName: "Martina",
        lastName: "Lagos",
        email: "martina@lumen.demo",
        phone: "+54 11 5555-1103",
        company: "Lumen Estudio",
        jobTitle: "Co-fundadora",
        source: "LinkedIn",
        organizationId: "org_nexo_demo",
        assignedToId: owner.id,
      },
      {
        id: "contact-pablo",
        firstName: "Pablo",
        lastName: "Ríos",
        email: "pablo@nodo.demo",
        phone: "+54 11 5555-1104",
        company: "Nodo Arquitectura",
        jobTitle: "Socio",
        source: "Referido",
        organizationId: "org_nexo_demo",
        assignedToId: owner.id,
      },
      {
        id: "contact-tomas",
        firstName: "Tomás",
        lastName: "Villar",
        email: "tomas@andessupply.demo",
        company: "Andes Supply",
        jobTitle: "Compras",
        source: "Evento",
        organizationId: "org_nexo_demo",
        assignedToId: owner.id,
      },
      {
        id: "contact-carla",
        firstName: "Carla",
        lastName: "Paz",
        email: "carla@puntonorte.demo",
        company: "Punto Norte",
        jobTitle: "Gerenta",
        source: "Web",
        organizationId: "org_nexo_demo",
        assignedToId: owner.id,
      },
      {
        id: "contact-diego",
        firstName: "Diego",
        lastName: "Núñez",
        email: "diego@bravalogistica.demo",
        company: "Brava Logística",
        jobTitle: "COO",
        source: "LinkedIn",
        organizationId: "org_nexo_demo",
        assignedToId: owner.id,
      },
      {
        id: "contact-sofia",
        firstName: "Sofía",
        lastName: "Arias",
        email: "sofia@casaoliva.demo",
        company: "Casa Oliva",
        jobTitle: "Fundadora",
        source: "Web",
        organizationId: "org_nexo_demo",
        assignedToId: owner.id,
      },
      {
        id: "contact-ana",
        firstName: "Ana",
        lastName: "Costa",
        email: "ana@mareawellness.demo",
        company: "Marea Wellness",
        jobTitle: "Directora",
        source: "Referido",
        organizationId: "org_nexo_demo",
        assignedToId: owner.id,
      },
      {
        id: "contact-mica",
        firstName: "Mica",
        lastName: "Torres",
        email: "mica@verdemercado.demo",
        company: "Verde Mercado",
        jobTitle: "Marketing",
        source: "Evento",
        organizationId: "org_nexo_demo",
        assignedToId: owner.id,
      },
    ],
  });

  await prisma.contactTag.createMany({
    data: [
      { contactId: "contact-lucia", tagId: "tag-priority" },
      { contactId: "contact-lucia", tagId: "tag-referral" },
      { contactId: "contact-agustin", tagId: "tag-inbound" },
      { contactId: "contact-martina", tagId: "tag-priority" },
      { contactId: "contact-pablo", tagId: "tag-referral" },
    ],
  });

  await prisma.opportunity.createMany({
    data: [
      {
        id: "op-1",
        title: "Rediseño de plataforma",
        valueInCents: 185000000,
        expectedCloseAt: daysFromNow(18),
        organizationId: "org_nexo_demo",
        contactId: "contact-martina",
        stageId: "stage-new",
        assignedToId: owner.id,
      },
      {
        id: "op-2",
        title: "Portal de distribuidores",
        valueInCents: 142000000,
        expectedCloseAt: daysFromNow(30),
        organizationId: "org_nexo_demo",
        contactId: "contact-tomas",
        stageId: "stage-new",
        assignedToId: owner.id,
      },
      {
        id: "op-3",
        title: "Automatización comercial",
        valueInCents: 86000000,
        expectedCloseAt: daysFromNow(24),
        organizationId: "org_nexo_demo",
        contactId: "contact-carla",
        stageId: "stage-new",
        assignedToId: owner.id,
      },
      {
        id: "op-4",
        title: "CRM para franquicias",
        valueInCents: 260000000,
        expectedCloseAt: daysFromNow(14),
        organizationId: "org_nexo_demo",
        contactId: "contact-lucia",
        stageId: "stage-qualified",
        assignedToId: owner.id,
      },
      {
        id: "op-5",
        title: "Dashboard operativo",
        valueInCents: 175000000,
        expectedCloseAt: daysFromNow(21),
        organizationId: "org_nexo_demo",
        contactId: "contact-diego",
        stageId: "stage-qualified",
        assignedToId: owner.id,
      },
      {
        id: "op-6",
        title: "Web institucional",
        valueInCents: 135000000,
        expectedCloseAt: daysFromNow(35),
        organizationId: "org_nexo_demo",
        contactId: "contact-sofia",
        stageId: "stage-qualified",
        assignedToId: owner.id,
      },
      {
        id: "op-7",
        title: "E-commerce B2B",
        valueInCents: 315000000,
        expectedCloseAt: daysFromNow(9),
        organizationId: "org_nexo_demo",
        contactId: "contact-agustin",
        stageId: "stage-proposal",
        assignedToId: owner.id,
      },
      {
        id: "op-8",
        title: "Sistema de reservas",
        valueInCents: 168000000,
        expectedCloseAt: daysFromNow(12),
        organizationId: "org_nexo_demo",
        contactId: "contact-ana",
        stageId: "stage-proposal",
        assignedToId: owner.id,
      },
      {
        id: "op-9",
        title: "Suite de gestión",
        valueInCents: 220000000,
        expectedCloseAt: daysFromNow(7),
        organizationId: "org_nexo_demo",
        contactId: "contact-pablo",
        stageId: "stage-negotiation",
        assignedToId: owner.id,
      },
      {
        id: "op-10",
        title: "App de fidelización",
        valueInCents: 162000000,
        expectedCloseAt: daysFromNow(11),
        organizationId: "org_nexo_demo",
        contactId: "contact-mica",
        stageId: "stage-negotiation",
        assignedToId: owner.id,
      },
    ],
  });

  await prisma.activity.createMany({
    data: [
      {
        id: "activity-1",
        type: "MEETING",
        status: "PLANNED",
        subject: "Demo con Sur Café",
        description: "Presentar el flujo de pipeline y reportes.",
        dueAt: hoursFromNow(2),
        organizationId: "org_nexo_demo",
        contactId: "contact-lucia",
        opportunityId: "op-4",
        ownerId: owner.id,
      },
      {
        id: "activity-2",
        type: "CALL",
        status: "PLANNED",
        subject: "Seguimiento propuesta",
        dueAt: hoursFromNow(5),
        organizationId: "org_nexo_demo",
        contactId: "contact-agustin",
        opportunityId: "op-7",
        ownerId: owner.id,
      },
      {
        id: "activity-3",
        type: "CALL",
        status: "PLANNED",
        subject: "Primera conversación",
        dueAt: hoursFromNow(8),
        organizationId: "org_nexo_demo",
        contactId: "contact-martina",
        opportunityId: "op-1",
        ownerId: owner.id,
      },
      {
        id: "activity-4",
        type: "EMAIL",
        status: "COMPLETED",
        subject: "Envío de caso de estudio",
        completedAt: hoursFromNow(-24),
        organizationId: "org_nexo_demo",
        contactId: "contact-pablo",
        opportunityId: "op-9",
        ownerId: owner.id,
      },
    ],
  });

  console.log("Datos ficticios de Nexo CRM cargados correctamente.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
