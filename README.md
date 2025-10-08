# Give Protocol - Web Application

Progressive Web App (PWA) for Give Protocol, a blockchain-based charitable giving platform.

## Features

- 🎯 Donor dashboard with real-time donation tracking
- 🏢 Charity management portal
- 💼 Volunteer verification system
- 📊 Analytics and impact reporting
- 🔐 Web3 wallet integration (MetaMask, WalletConnect)
- 🌍 Multi-language support (i18next)
- 📱 Progressive Web App capabilities

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router v6
- **Blockchain**: ethers.js, viem
- **Backend**: Supabase
- **Monitoring**: Sentry
- **Testing**: Jest, Cypress

## Setup

```bash
npm install
```

## Configuration

Copy `.env.example` to `.env`:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_MOONBASE_RPC_URL=
```

## Development

```bash
# Start dev server
npm run dev

# Run tests
npm run test

# Run linter
npm run lint

# E2E tests
npm run test:e2e
```

## Building

```bash
# Production build
npm run build

# Preview production build
npm run preview
```

## Code Quality

This project follows strict code quality standards:
- DeepSource analysis
- SonarQube integration
- See CLAUDE_CODE_RULES.md for detailed guidelines

## Deployment

Deploy to Vercel or any static hosting provider:

```bash
npm run build
# Deploy dist/ folder
```

## Documentation

- [Development Guidelines](CLAUDE.md)
- [Code Quality Rules](CLAUDE_CODE_RULES.md)
- [Testing Guidelines](TEST_GUIDELINES.md)

## License

UNLICENSED - Private Repository
