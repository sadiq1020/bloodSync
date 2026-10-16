# BloodSync

**BloodSync** is an emergency blood donor and request matching platform designed to connect blood seekers with eligible, compatible donors rapidly and efficiently.

## Project Structure

```
bloodSync/
├── client/              # Frontend application (Next.js / Vite)
├── server/              # Backend application (Express 5, TypeScript, Prisma, Better Auth)
├── .gitignore           # Global git ignore
└── README.md            # Project overview and documentation
```

## Features Overview
- **Unified User Model**: Single user account can act as a blood requester or switch on a donor profile.
- **Donor Eligibility & Gap Tracking**: 90-day donation interval validation.
- **Compatible Blood Group Matching**: Deterministic compatibility matrix and proximity-based donor scoring.
- **Blood Request Workflow**: `OPEN` → `MATCHED` → `FULFILLED` (with `EXPIRED` and `CANCELLED`).
- **AI-Powered Emergency Extraction**: Free-form request parser using Gemini (via OpenRouter) to auto-fill blood group, location, and urgency.
- **Privacy & Safety**: Donor contact info exposed strictly to authorized request owners for open requests.

## Server Quick Start
See [server/README.md](server/README.md) for detailed backend setup and API documentation.
