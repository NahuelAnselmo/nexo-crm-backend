import { Router } from "express";
import { requireAuth } from "../auth/session.js";
import { prisma } from "../lib/prisma.js";

export const dashboardRouter = Router();
dashboardRouter.use(requireAuth);

dashboardRouter.get("/", async (_request, response) => {
  const organizationId = response.locals.auth.organization.id as string;
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const now = new Date();

  const [
    stages,
    pendingActivities,
    contacts,
    openAggregate,
    openCount,
    wonCount,
    lostCount,
  ] = await Promise.all([
    prisma.pipelineStage.findMany({
      where: { organizationId },
      orderBy: { position: "asc" },
      include: {
        opportunities: {
          where: { status: "OPEN" },
          orderBy: { updatedAt: "desc" },
          include: {
            contact: true,
            assignedTo: { select: { id: true, name: true } },
          },
        },
      },
    }),
    prisma.activity.findMany({
      where: { organizationId, status: "PLANNED", dueAt: { gte: now } },
      orderBy: { dueAt: "asc" },
      take: 8,
      include: {
        contact: true,
        opportunity: { select: { id: true, title: true } },
        owner: { select: { id: true, name: true } },
      },
    }),
    prisma.contact.findMany({
      where: { organizationId },
      orderBy: { updatedAt: "desc" },
      take: 8,
      include: {
        assignedTo: { select: { id: true, name: true } },
        tags: { include: { tag: true } },
        opportunities: {
          where: { status: "OPEN" },
          select: { id: true, title: true, status: true },
        },
      },
    }),
    prisma.opportunity.aggregate({
      where: { organizationId, status: "OPEN" },
      _sum: { valueInCents: true },
    }),
    prisma.opportunity.count({ where: { organizationId, status: "OPEN" } }),
    prisma.opportunity.count({
      where: {
        organizationId,
        status: "WON",
        closedAt: { gte: ninetyDaysAgo },
      },
    }),
    prisma.opportunity.count({
      where: {
        organizationId,
        status: "LOST",
        closedAt: { gte: ninetyDaysAgo },
      },
    }),
  ]);

  const closedCount = wonCount + lostCount;
  return response.json({
    data: {
      organization: response.locals.auth.organization,
      account: {
        user: {
          id: response.locals.auth.user.id,
          name: response.locals.auth.user.name,
          email: response.locals.auth.user.email,
        },
        role: response.locals.auth.membership.role,
      },
      metrics: {
        openPipelineInCents: openAggregate._sum.valueInCents ?? 0,
        openOpportunities: openCount,
        conversionRate: closedCount ? wonCount / closedCount : 0,
        pendingActivities: pendingActivities.length,
      },
      stages,
      activities: pendingActivities,
      contacts,
    },
  });
});
