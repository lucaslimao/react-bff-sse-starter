# project-starter

Template fullstack com Front (Vite + React) e BFF (Fastify).

## Estrutura

```
project-starter/
├── front/   → Vite + React + TS + Tailwind + Shadcn + Zustand + TanStack Query
└── bff/     → Fastify + TS + @fastify/swagger + SSE
```

## Deploy

| App   | Plataforma | Comando         |
|-------|------------|-----------------|
| front | Vercel     | `npm run build` |
| bff   | Railway    | `npm run start` |

## Início rápido

```bash
# Front
cd front && npm install && npm run dev

# BFF (outro terminal)
cd bff && npm install && npm run dev
```
