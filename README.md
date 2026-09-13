# AgntSpark Console

The web dashboard for the [AgntSpark](https://github.com/AgntSpark1) AI agent hosting platform.

It talks to [`agntspark-gateway`](https://github.com/AgntSpark1/agntspark-gateway) over its real `/v1` API — every screen reflects what the gateway actually supports today, nothing is mocked.

## Features

- **Sign in / create account** — email + password against `POST /v1/auth/login` and `/v1/auth/register`; the session JWT is kept in `localStorage` and dropped automatically on a 401.
- **Dashboard** — total / running / failed agent counts and total replicas, computed from `GET /v1/agents`.
- **Agents** — search and filter by status, create-and-deploy an agent from a container image (replicas, CPU, memory), scale up/down, delete.
- **Agent detail** — live CPU / memory from Docker stats (`GET /v1/agents/{id}/metrics`) and a tail of container logs (`GET /v1/agents/{id}/logs`, refreshed every 5s).
- **Settings → API Keys** — generate (raw key shown once), list, and revoke keys for the `agntspark` CLI and Python SDK.
- **Settings → Account** — the signed-in user from `GET /v1/auth/me`.

### Deliberately not in the console

These don't exist in the gateway yet, so there's no UI pretending otherwise: multi-environment deploys, rollout strategies, pause/resume, request-level metrics / latency percentiles, token usage, cost estimates, webhooks, team management, and a public URL per agent. See the gateway README's "Known follow-ups".

## Tech Stack

| Layer            | Technology                   |
| ---------------- | ---------------------------- |
| Framework        | React 18 + TypeScript        |
| Build Tool       | Vite 5                       |
| Styling          | TailwindCSS 3                |
| Data Fetching    | TanStack React Query 5       |
| State Management | Zustand 4                    |
| Routing          | React Router 6               |
| Icons            | lucide-react                 |
| HTTP Client      | Axios                        |

## Project Structure

```
src/
├── api/
│   ├── client.ts             # Axios client: Bearer token, 401 → /login, error normalization
│   └── types.ts              # Request payload types
├── components/
│   ├── Layout.tsx            # App shell
│   ├── Sidebar.tsx           # Nav + signed-in user + sign out
│   ├── AgentCard.tsx         # Agent summary with scale / logs / delete
│   ├── AgentDetailPanel.tsx  # Live metrics + log tail
│   ├── CreateAgentModal.tsx  # Create-and-deploy form
│   └── StatusBadge.tsx       # Agent status pill
├── hooks/
│   ├── useAuth.ts            # login / register / me / logout
│   ├── useAgents.ts          # list / get / create / scale / delete / logs / metrics
│   └── useApiKeys.ts         # list / create / revoke
├── pages/
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── Agents.tsx
│   └── Settings.tsx
├── store/agentStore.ts       # UI state (filters, selected agent, modal)
├── types/index.ts            # Mirrors the gateway's response shapes
├── App.tsx                   # Routes + auth guard
└── main.tsx
```

## Development

### Prerequisites

- Node.js 18+
- `agntspark-gateway` running locally (default `http://localhost:8080`) with Postgres and a Docker daemon — see its README.

### Run

```bash
npm install
npm run dev          # http://localhost:5173
```

The dev server proxies `/v1/*` to the gateway at `http://localhost:8080`. If that port is taken on your machine, point it elsewhere:

```bash
VITE_DEV_PROXY_TARGET=http://localhost:8899 npm run dev
```

For a deployed build, set `VITE_API_URL` to the gateway's full `/v1` base URL (e.g. `https://api.agntspark.io/v1`).

## Build

```bash
npm run build        # tsc -b + vite build → dist/
npm run preview
```

## CI

`.github/workflows/ci.yml` runs `npm ci`, `npm run type-check`, and `npm run build` on every push and PR.

## License

MIT © 2026 AgntSpark LLC
