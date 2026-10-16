# BloodSync Backend

Express 5 and TypeScript backend for the BloodSync blood donor and emergency blood request matching system.

## Project Structure

```text
server/
├── src/
│   ├── app.ts                  # Express setup, middlewares, routes
│   ├── server.ts               # Server bootstrap & lifecycle
│   ├── config/
│   │   └── env.ts              # Zod-validated environment variables
│   ├── constants/
│   │   ├── bloodGroups.ts      # Compatible blood group constants
│   │   └── districts.ts        # 64 Bangladesh districts
│   ├── middlewares/
│   │   ├── errorHandler.ts     # Global error handling
│   │   ├── notFound.ts         # 404 handler
│   │   └── rateLimiter.ts      # Express rate limiter
│   ├── utils/
│   │   ├── AppError.ts         # Operational error class
│   │   └── catchAsync.ts       # Async route wrapper
│   ├── lib/                    # Pure business logic (matching, eligibility)
│   ├── modules/
│   │   └── health/             # Health module (*.route, *.controller, *.service, *.validation)
│   └── tests/                  # Unit and integration tests
├── .env.example                # Sample environment variables
├── package.json
└── tsconfig.json
```

## Available Scripts

- `npm run dev`: Start dev server with live reload via `tsx`
- `npm run build`: Compile TypeScript into `dist/`
- `npm start`: Run the compiled production build from `dist/server.js`

## Endpoints

- `GET /api/health`: Health status & server uptime check
