# AgntSpark Console

The web-based management dashboard for the [AgntSpark](https://github.com/AgntSpark1) AI Agent platform.

## Screenshots

<!-- TODO: add screenshots -->

![Dashboard](https://placeholder.agntspark.dev/console-dashboard.png)
![Agents](https://placeholder.agntspark.dev/console-agents.png)
![Analytics](https://placeholder.agntspark.dev/console-analytics.png)

## Features

- **Dashboard Overview** — Real-time metrics, active agent count, request throughput, and error rates at a glance.
- **Agent Management** — Create, configure, deploy, pause, and delete AI agents from a unified interface.
- **Deployment Wizard** — Step-by-step guided deployment with environment selection, resource allocation, and rollout strategy.
- **Analytics & Metrics** — Time-series charts for token usage, latency percentiles, cost breakdown, and per-agent performance.
- **Settings** — API key management, webhook configuration, team access control, and billing preferences.
- **Responsive Design** — Works on desktop, tablet, and mobile with a dark-first theme optimized for extended sessions.

## Tech Stack

| Layer            | Technology                                    |
| ---------------- | --------------------------------------------- |
| Framework        | React 18 + TypeScript                         |
| Build Tool       | Vite 5                                        |
| Styling          | TailwindCSS 3                                 |
| Data Fetching    | TanStack React Query 5                        |
| State Management | Zustand 4                                     |
| Routing          | React Router 6                                |
| Charts           | Recharts 2                                    |
| Icons            | lucide-react                                  |
| HTTP Client      | Axios                                         |

## Project Structure

```
agntspark-console/
├── .github/
│   └── workflows/
│       └── ci.yml              # Build + type-check pipeline
├── src/
│   ├── api/
│   │   ├── client.ts           # Axios-based API client
│   │   └── types.ts            # API response/request types
│   ├── components/
│   │   ├── Layout.tsx          # App shell: sidebar + topbar
│   │   ├── Sidebar.tsx         # Navigation sidebar
│   │   ├── AgentCard.tsx       # Agent summary card
│   │   ├── MetricsChart.tsx    # Recharts wrapper
│   │   ├── DeployModal.tsx     # Deployment dialog
│   │   └── StatusBadge.tsx     # Agent status pill
│   ├── hooks/
│   │   ├── useAgents.ts        # Agent data hooks (React Query)
│   │   └── useMetrics.ts       # Metrics data hooks
│   ├── pages/
│   │   ├── Dashboard.tsx       # Overview page
│   │   ├── Agents.tsx          # Agent list & management
│   │   ├── Deploy.tsx          # Deployment wizard
│   │   ├── Analytics.tsx       # Deep metrics
│   │   └── Settings.tsx       # Platform settings
│   ├── store/
│   │   └── agentStore.ts       # Zustand store for UI state
│   ├── types/
│   │   └── index.ts            # Shared TypeScript types
│   ├── App.tsx                 # Root component + routes
│   ├── main.tsx                # Vite entry point
│   └── index.css               # Tailwind + custom styles
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── LICENSE
```

## Development Setup

### Prerequisites

- Node.js 18+ (use [fnm](https://github.com/Schniz/fnm) or [nvm](https://github.com/nvm-sh/nvm))
- The AgntSpark API server running locally on port 8000 (or update the proxy in `vite.config.ts`)

### Install & Run

```bash
# clone
git clone https://github.com/AgntSpark1/agntspark-console.git
cd agntspark-console

# install dependencies
npm install

# start dev server (http://localhost:5173)
npm run dev
```

The dev server proxies `/api` requests to `http://localhost:8000` by default.

## Build

```bash
# type-check + production build
npm run build

# preview the production build locally
npm run preview
```

Output is written to `dist/`.

## CI

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push and PR:

1. `npm ci`
2. `npm run type-check`
3. `npm run build`

## License

MIT © 2026 AgntSpark LLC
