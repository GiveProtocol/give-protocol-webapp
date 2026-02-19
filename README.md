# Give Protocol Web Application

Progressive Web Application for Give Protocol, a Delaware-based 501(c)(3) nonprofit enabling transparent charitable giving through blockchain technology. This app serves donors, charities, volunteers, and administrators with multi-chain crypto donations, fiat payments, portfolio fund management, and volunteer verification.

<!-- Screenshot placeholder: Replace with an actual screenshot of the running application -->
<!-- ![Give Protocol Dashboard](docs/images/dashboard-screenshot.png) -->

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- A Supabase project (for authentication and database)


**Donor:** Register or connect wallet, browse charities at `/browse`, make crypto or fiat donations, track all giving in `/give-dashboard`, manage recurring donations at `/scheduled-donations`.

**Charity:** Register at `/register`, manage organization profile and causes in `/charity-portal`, post volunteer opportunities, view donation analytics and impact reporting.

**Volunteer:** Browse opportunities at `/opportunities`, self-report hours, receive verification links, track contribution history at `/contributions`.

**Admin:** Access `/admin` for charity approval, user management, donation monitoring, withdrawal processing, and audit logs.

## Wallet Integration

The app supports a broad range of wallet providers for EVM-compatible chains:

| Wallet | Type | Notes |
|--------|------|-------|
| MetaMask | Browser extension | Most widely used; auto-detected |
| WalletConnect | Protocol | Connects mobile and desktop wallets |
| Ledger | Hardware | Via @ledgerhq/device-signer-kit-ethereum |
| Safe (Gnosis) | Multisig | Via @safe-global/safe-apps-sdk |
| Coinbase Wallet | Browser/mobile | Native integration |
| Phantom | Browser extension | EVM mode |
| Rabby | Browser extension | Multi-chain |
| Talisman | Browser extension | Polkadot and EVM |
| SubWallet | Browser extension | Polkadot and EVM |

**Wallet features:**
- Auto-detection of installed browser wallets
- Chain switching with user confirmation
- Real-time balance tracking across connected chains
- Transaction signing, submission, and status monitoring
- Wallet disconnect synced with authentication logout

**Supported chains:** Base, Optimism, Moonbeam, Polkadot, Solana, Bitcoin. 

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript 5 |
| Build | Vite 7 (SSR support, code splitting, gzip) |
| Routing | React Router v6 |
| Server state | TanStack React Query v5 |
| Client state | React Context (Auth, Web3, Chain, Settings, Currency, Toast) |
| Styling | TailwindCSS 3 |
| Rich text | Tiptap editor |
| Blockchain | ethers.js v6, viem v2 |
| Database/Auth | Supabase (PostgreSQL, Auth, Realtime) |
| Fiat payments | Helcim (via Supabase Edge Functions) |
| Monitoring | Sentry 9, custom performance monitoring |
| Testing | Jest 30 (unit), Cypress 13 (E2E) |
| Code quality | ESLint 8, SonarCloud, DeepSource |

### State Management

- **React Query** handles all server/async state: API responses, caching, background refetch, optimistic updates.
- **React Context** handles client-only state: authenticated user, active wallet/chain, UI preferences, toast notifications.
- No external state management library (Redux, Zustand, etc.) is used. React Query covers the complexity that would traditionally require one.

## Scripts

```bash
# Development
npm run dev              # Vite dev server with SSR (port 5173)
npm run dev:spa          # SPA mode (no SSR)

# Build
npm run build            # Production build (client + SSR server)
npm run build:spa        # SPA-only build (for Netlify)
npm run preview          # Preview production build locally

# Quality
npm run lint             # ESLint (max 200 warnings)
npm run test             # Jest unit tests
npm run test:e2e         # Cypress E2E (interactive)
npm run test:e2e:headless # Cypress headless
```


```

## Deployment

### Vercel (Primary)

Deployment is configured in `vercel.json` with SSR support, security headers (CSP, HSTS, X-Frame-Options), SPA rewrites, and long-lived cache headers for static assets.

```bash
npm run build
vercel deploy --prod
```

### Netlify (Alternative)

Configured in `netlify.toml`. Uses SPA mode (no SSR).

```bash
npm run build:spa
netlify deploy --prod --dir=dist
```

### Self-Hosted (Nginx)

An `nginx.conf` is provided for self-hosted deployments with SSL, gzip, and SPA fallback routing.

### Docker

```bash
docker build -t give-protocol-webapp .
docker run -p 3000:5173 give-protocol-webapp
```

## Repository Context

This is the **webapp** repository in the Give Protocol multi-repo architecture:

| Repository | Purpose |
|------------|---------|
| [give-protocol-webapp](https://github.com/GiveProtocol/give-protocol-webapp) | React web application (this repo) |
| [give-protocol-backend](https://github.com/GiveProtocol/give-protocol-backend) | Supabase database and admin |
| [give-protocol-contracts](https://github.com/GiveProtocol/give-protocol-contracts) | Solidity smart contracts |
| [give-protocol-docs](https://github.com/GiveProtocol/give-protocol-docs) | Documentation site |

**Boundary rules:** Database schema migrations go in the backend repo. Edge functions (Deno) go in this repo under `supabase/functions/`. Smart contracts go in the contracts repo. See the root `CLAUDE.md` for full details.

## License

This project is licensed under the MIT License.
