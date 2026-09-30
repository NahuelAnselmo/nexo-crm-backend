# Nexo CRM — API

API multiempresa para centralizar contactos, oportunidades comerciales y
seguimientos. Forma parte de **Nexo CRM**, un producto demostrativo pensado para
pymes y equipos de ventas que hoy reparten su información entre planillas,
mensajes y notas.

## Stack

- Node.js 22+
- Express 5 y TypeScript estricto
- PostgreSQL con Prisma 7
- Zod para contratos de entrada
- Vitest y Supertest

## Modelo inicial

El esquema separa los datos por organización y contempla usuarios con roles,
contactos, etiquetas, etapas de pipeline, oportunidades y actividades. Las
relaciones e índices preparan búsquedas por responsable, estado, etapa y fecha
sin mezclar información entre clientes del producto.

## Desarrollo local

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run dev
```

La API queda disponible en `http://localhost:4100/api/v1` y expone inicialmente
`GET /health`.

## Verificación

```bash
npm run prisma:validate
npm run typecheck
npm test
npm run build
npm audit
```

## Próximas etapas

1. Autenticación y selección segura de organización.
2. Datos ficticios reproducibles para la demo.
3. CRUD de contactos y oportunidades con permisos por rol.
4. Pipeline comercial, actividades y métricas.
5. Integración con el frontend y despliegue público.
