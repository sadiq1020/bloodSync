# BloodSync Server — Render Deployment Guide

This document describes how to deploy the BloodSync Express backend to [Render](https://render.com) (Node.js Web Service) and how to run database migrations and seed scripts against the production database from a local machine using Windows PowerShell.

---

## 1. Render Web Service Configuration

Create a new **Web Service** on Render and configure the following settings:

| Setting | Value |
| :--- | :--- |
| **Runtime** | `Node` |
| **Root Directory** | `server` (if deploying from a monorepo) or leave empty if the repository root is the server |
| **Build Command** | `npm install && npm run build` (or `npm ci && npm run build`) |
| **Start Command** | `npm run start` (executes `node dist/server.js`) |
| **Plan** | Free (or Starter) |

> **Note on Free Instance Spin-Down**: Render's free tier spins down instances after 15 minutes of inactivity. When a new request arrives, it may take 30–50 seconds to wake up. The frontend request timeout accounts for this cold start.

---

## 2. Environment Variables

Configure the following environment variables in the Render dashboard under **Environment**:

| Variable | Description | Example / Recommended Value |
| :--- | :--- | :--- |
| `NODE_ENV` | Application environment mode | `production` |
| `PORT` | HTTP port for Express | `5000` (Render will also set its internal port) |
| `DATABASE_URL` | Neon PostgreSQL **pooled** connection URL | `postgresql://user:pass@ep-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require` |
| `DIRECT_URL` | Neon PostgreSQL **direct** connection URL | `postgresql://user:pass@ep.us-east-2.aws.neon.tech/neondb?sslmode=require` |
| `FRONTEND_URL` | Public production URL of the Next.js frontend | `https://your-app.vercel.app` |
| `BETTER_AUTH_URL` | Public base URL used by Better Auth | `https://your-app.vercel.app` (when `/api` is proxied) or Render backend URL |
| `BETTER_AUTH_SECRET` | 32+ character random secret for session signing | Generated secure string |
| `OPENROUTER_API_KEY` | OpenRouter API Key for AI request parsing | `sk-or-v1-...` |
| `OPENROUTER_MODEL` | AI model identifier | `openrouter/free` (or `google/gemini-2.5-flash`) |
| `OPENROUTER_TIMEOUT_MS` | AI request timeout in milliseconds | `30000` |
| `ADMIN_EMAIL` | Default administrator email | `admin@yourdomain.com` |
| `ADMIN_PASSWORD` | Default administrator password | Secure password |
| `DEMO_PASSWORD` | Password assigned to demo donors | Secure password |

---

## 3. Reverse Proxy & Cookie Architecture

- **Architecture**: `Browser -> Vercel (Next.js rewrite /api) -> Render (Express)`
- **Trust Proxy**: In production (`NODE_ENV=production`), `app.set("trust proxy", 1)` is enabled in `app.ts` so Express correctly parses the client IP from the `X-Forwarded-For` header set by the upstream reverse proxy.
- **Cookies**: Better Auth runs with `useSecureCookies: true` in production. Cookies use `SameSite=Lax`, which is fully compatible with the Vercel-to-Render reverse proxy architecture because requests appear same-origin to the browser.
- **Rate Limiting**:
  - `generalLimiter` is set to **600 requests per 15 minutes** per IP to safely accommodate proxied traffic without false positives.
  - `aiLimiter` is keyed primarily by authenticated **User ID**, preventing abuse per user regardless of shared proxy IPs.

---

## 4. Running Migrations & Seeds Against Production (Windows PowerShell)

To apply migrations and seed initial data into the production Neon PostgreSQL database from your local terminal, follow these steps in Windows PowerShell.

### Step 1: Open Terminal in the Server Directory

```powershell
cd server
```

### Step 2: Set Temporary Environment Variables in PowerShell

Set your production database connection strings and seed credentials for the current PowerShell session:

```powershell
$env:DATABASE_URL="postgresql://neondb_owner:YOUR_PROD_PASSWORD@ep-xxxx-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
$env:DIRECT_URL="postgresql://neondb_owner:YOUR_PROD_PASSWORD@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
$env:BETTER_AUTH_SECRET="your-production-better-auth-secret-here-min-32-chars"
$env:BETTER_AUTH_URL="https://your-app.vercel.app"
$env:FRONTEND_URL="https://your-app.vercel.app"
$env:OPENROUTER_API_KEY="sk-or-v1-your-key-here"
$env:OPENROUTER_MODEL="openrouter/free"
$env:ADMIN_EMAIL="admin@bloodsync.com"
$env:ADMIN_PASSWORD="YourSecureAdminPassword123"
$env:DEMO_PASSWORD="YourSecureDemoPassword123"
$env:NODE_ENV="production"
```

### Step 3: Run Database Migrations

Deploy all pending Prisma migrations using the dedicated `db:deploy` script (uses `DIRECT_URL` to bypass transaction pooling):

```powershell
npm run db:deploy
```

### Step 4: Run Seeds

**1. Seed Admin User:**
Creates or elevates the initial admin user specified in `$env:ADMIN_EMAIL`:

```powershell
npm run seed
```

**2. (Optional) Seed Demo Donors and Requests:**
Populates 20 diverse demo donors and realistic sample requests across Bangladesh districts:

```powershell
npm run seed:demo
```

### Step 5: Clear Environment Variables

Once migrations and seeds are complete, clean up the environment variables from your PowerShell session to prevent accidental reuse:

```powershell
Remove-Item Env:DATABASE_URL
Remove-Item Env:DIRECT_URL
Remove-Item Env:BETTER_AUTH_SECRET
Remove-Item Env:BETTER_AUTH_URL
Remove-Item Env:FRONTEND_URL
Remove-Item Env:OPENROUTER_API_KEY
Remove-Item Env:OPENROUTER_MODEL
Remove-Item Env:ADMIN_EMAIL
Remove-Item Env:ADMIN_PASSWORD
Remove-Item Env:DEMO_PASSWORD
Remove-Item Env:NODE_ENV
```

Verify that they have been cleared:

```powershell
Get-ChildItem Env:DATABASE_URL, Env:DIRECT_URL -ErrorAction SilentlyContinue
```

