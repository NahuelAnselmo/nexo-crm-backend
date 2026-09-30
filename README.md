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

Las sesiones usan cookies HTTP-only y cada consulta toma la organización desde la
membresía autenticada. El esquema separa los datos por organización y contempla usuarios con roles,
contactos, etiquetas, etapas de pipeline, oportunidades y actividades. Las
relaciones e índices preparan búsquedas por responsable, estado, etapa y fecha
sin mezclar información entre clientes del producto.

## Desarrollo local

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run db:migrate -- --name init
npm run db:seed
npm run dev
```

La API queda disponible en `http://localhost:4100/api/v1`. Sus primeros contratos son:

- `GET /health`: estado del servicio.
- `POST /auth/login`, `GET /auth/me` y `POST /auth/logout`: sesión segura.
- `GET /dashboard`: métricas, pipeline, actividades y contactos de la organización autenticada.

El seed es reproducible y crea **Nexo Agency**, cuatro etapas comerciales, diez
contactos, oportunidades, etiquetas, actividades y un usuario propietario:

- Email: `admin@nexocrm.demo`
- Contraseña: `Demo1234!`

Por seguridad, el seed se bloquea en producción salvo que se habilite
explícitamente `ALLOW_DEMO_SEED=true` durante la preparación controlada de una
demo.

## Verificación

```bash
npm run prisma:validate
npm run typecheck
npm test
npm run build
npm audit
```

## Próximas etapas

1. CRUD de contactos y oportunidades con permisos por rol.
2. Mutaciones del pipeline y actividades con permisos por rol.
3. Integración con el frontend y despliegue público.
