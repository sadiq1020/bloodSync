# BloodSync

Emergency blood donor and request matching platform connecting blood seekers with eligible, compatible donors rapidly and safely.

- Frontend: [Live Frontend (Placeholder)](https://bloodsync-frontend.placeholder.com)
- Backend API: [Live API (Placeholder)](https://bloodsync-backend.placeholder.com)
- Repository: [GitHub Repository (Placeholder)](https://github.com/placeholder/bloodSync)

---

## 1. The Problem and the Solution

In emergencies, finding compatible blood donors typically relies on unstructured posts across social media groups and messaging apps. This results in critical delays, repeated outreach to ineligible donors, and difficulty assessing geographic proximity.

BloodSync provides a centralized platform that manages verified blood requests, enforces strict 90-day recovery intervals for donor eligibility, matches donors via a deterministic 8-group compatibility matrix, ranks candidates by district proximity, and extracts structured request data from emergency text messages using artificial intelligence.

---

## 2. Features

- Unified User Model: A single account acts as a blood requester and can toggle on an active donor profile without managing separate accounts.
- Donor Eligibility Gap: Automated enforcement of the 90-day minimum recovery interval between blood donations.
- Deterministic Compatibility Matrix: Evaluates ABO and Rh compatibility across all 8 blood groups (A+, A-, B+, B-, AB+, AB-, O+, O-).
- Candidate Ranking Algorithm: Ranks compatible donors by location proximity (same district and area priority) and donation readiness.
- Request Lifecycle Management: Tracks request states across OPEN, MATCHED, FULFILLED, EXPIRED, and CANCELLED.
- Contact Privacy Guard: Sensitive donor and patient contact numbers are restricted from public feeds and revealed exclusively to matched, authorized participants.
- AI-Powered Text Parser: Uses LLM structured inference (Gemini via OpenRouter) with strict Zod validation to convert messy emergency posts into structured request fields.
- Admin Moderation Suite: User blocking with immediate session invalidation, administrative request closures, hard deletion, and database aggregate analytics.

---

## 3. User Roles and Workflows

The platform operates on two system roles:
- USER: Regular authenticated account. Users can post blood requests, search for donors, volunteer for open requests, or activate a donor profile.
- ADMIN: Administrative account with platform moderation authority. Admins can block abusive users, close or delete invalid requests, and view aggregated system metrics.

### Request Status Lifecycle

```mermaid
stateDiagram-v2
    [*] --> OPEN: Requester creates blood request
    OPEN --> MATCHED: Accepted donations reach unitsNeeded
    OPEN --> EXPIRED: Request passes neededBy timestamp
    OPEN --> CANCELLED: Requester or Admin cancels request
    MATCHED --> FULFILLED: Accepted donations marked COMPLETED
    MATCHED --> CANCELLED: Requester or Admin cancels request
    MATCHED --> EXPIRED: Request passes neededBy timestamp
    FULFILLED --> [*]
    EXPIRED --> [*]
    CANCELLED --> [*]
```

### Donation Status Lifecycle

```mermaid
stateDiagram-v2
    [*] --> PENDING: Eligible and compatible donor volunteers
    PENDING --> ACCEPTED: Request owner accepts volunteer
    PENDING --> CANCELLED: Request cancelled or closed
    ACCEPTED --> COMPLETED: Donation confirmed completed
    ACCEPTED --> CANCELLED: Request cancelled or closed
    COMPLETED --> [*]
    CANCELLED --> [*]
```

---

## 4. Tech Stack

- Runtime: Node.js (v20+)
- Framework: Express 5
- Language: TypeScript
- Database: PostgreSQL (Neon Serverless)
- ORM: Prisma ORM
- Authentication: Better Auth (session cookies, scrypt password hashing)
- Validation: Zod
- AI / LLM: OpenRouter API (Google Gemini 2.5 Flash / Minimax)
- Security: Helmet, CORS, Express Rate Limit
- Logging: Pino, Pino-Http
- Testing: Vitest

---

## 5. Architecture

The backend follows a layered architectural pattern:
- Route: Declares HTTP methods and mounts authentication and validation middleware.
- Validation: Zod schemas validating request body, query parameters, and route parameters.
- Controller: Handles HTTP request/response parsing, error delegation via catchAsync, and status codes.
- Service: Executes database queries, Prisma transactions, and business logic.
- Pure Libraries: Deterministic blood compatibility matching, donor scoring, and date-based eligibility calculations isolated from database operations.

```text
server/
├── prisma/
│   ├── schema.prisma           # Prisma database schema
│   ├── seed.ts                 # Admin seed script
│   └── seed-demo.ts            # Realistic demo dataset seed
├── src/
│   ├── app.ts                  # Express application setup and routing
│   ├── server.ts               # Server bootstrap and graceful shutdown
│   ├── config/                 # Environment variables, Prisma client, Better Auth
│   ├── constants/              # Bangladesh districts (64) and blood groups
│   ├── lib/                    # Compatibility matrix, donor ranking, eligibility
│   ├── middlewares/            # Auth guards, role guards, error handlers, rate limiters
│   ├── modules/
│   │   ├── admin/              # Admin moderation, stats, user blocking
│   │   ├── ai/                 # OpenRouter emergency request parser
│   │   ├── donation/           # Volunteering, status progression, reviews
│   │   ├── donor/              # Donor profile management and public search
│   │   ├── health/             # Health check endpoint
│   │   ├── request/            # Blood request creation, feed, cancellation
│   │   └── user/               # Authenticated user profile retrieval
│   ├── tests/                  # Unit and integration test suites
│   └── utils/                  # AppError class and catchAsync wrapper
```

---

## 6. Database Design

```mermaid
erDiagram
    User ||--o{ Session : "has"
    User ||--o{ Account : "has"
    User ||--o| DonorProfile : "maintains"
    User ||--o{ BloodRequest : "creates"
    User ||--o{ Donation : "volunteers"
    BloodRequest ||--o{ Donation : "receives"

    User {
        string id PK
        string name
        string email UK
        boolean emailVerified
        Role role
        boolean isBlocked
        datetime createdAt
        datetime updatedAt
    }

    Session {
        string id PK
        string token UK
        string userId FK
        datetime expiresAt
        datetime createdAt
    }

    DonorProfile {
        string id PK
        string userId FK, UK
        BloodGroup bloodGroup
        string district
        string area
        string phone
        boolean isAvailable
        datetime lastDonatedAt
        datetime createdAt
        datetime updatedAt
    }

    BloodRequest {
        string id PK
        string requesterId FK
        string patientName
        BloodGroup bloodGroup
        int unitsNeeded
        string hospital
        string district
        string area
        Urgency urgency
        datetime neededBy
        string contactPhone
        string note
        boolean forSelf
        RequestStatus status
        datetime createdAt
        datetime updatedAt
    }

    Donation {
        string id PK
        string requestId FK
        string donorId FK
        DonationStatus status
        datetime createdAt
        datetime updatedAt
    }
```

---

## 7. API Overview

| Method | Path | Authentication | Purpose |
| :--- | :--- | :--- | :--- |
| GET | `/api/health` | None | Server uptime and health status |
| ALL | `/api/auth/*` | Better Auth | Registration, login, logout, and session handling |
| GET | `/api/me` | USER / ADMIN | Retrieve authenticated user profile |
| POST | `/api/donors/me` | USER | Create personal donor profile |
| GET | `/api/donors/me` | USER | View personal donor profile with eligibility details |
| PATCH | `/api/donors/me` | USER | Update personal donor profile |
| GET | `/api/donors/search` | USER / ADMIN | Public search for eligible donors by blood group and district |
| POST | `/api/requests` | USER | Create a new blood request |
| GET | `/api/requests` | USER / ADMIN | Public feed of blood requests (omits patient phone) |
| GET | `/api/requests/mine` | USER | List authenticated user requests with donation status counts |
| GET | `/api/requests/:id` | USER / ADMIN | Detailed request view (reveals phone only to owner and volunteers) |
| PATCH | `/api/requests/:id/cancel` | USER | Cancel open or matched request owned by user |
| GET | `/api/requests/:id/donors` | USER / ADMIN | View top 20 ranked candidate donors for an open request |
| POST | `/api/requests/:id/volunteer` | USER | Volunteer to donate for an open request |
| GET | `/api/requests/:id/donations` | USER (Owner) | List volunteer donors for owned blood request |
| GET | `/api/donations/mine` | USER | List user donation history and current statuses |
| PATCH | `/api/donations/:id/accept` | USER (Owner) | Accept pending donation (auto-matches request when target reached) |
| PATCH | `/api/donations/:id/complete` | USER (Owner/Donor) | Confirm donation completed (updates donor lastDonatedAt) |
| PATCH | `/api/donations/:id/cancel` | USER (Owner/Donor) | Cancel pending or accepted donation |
| POST | `/api/ai/parse-request` | USER / ADMIN | Parse unstructured text into structured request fields |
| GET | `/api/admin/users` | ADMIN | List users with search, role, isBlocked, and donor profile flag |
| PATCH | `/api/admin/users/:id/block` | ADMIN | Block/unblock user and immediately purge active sessions |
| GET | `/api/admin/requests` | ADMIN | View all requests with donation status counts |
| PATCH | `/api/admin/requests/:id/close` | ADMIN | Administratively cancel request and all associated active donations |
| DELETE | `/api/admin/requests/:id` | ADMIN | Hard delete abusive request and associated donations |
| GET | `/api/admin/stats` | ADMIN | System analytics aggregated via Prisma count and groupBy |

---

## 8. AI Feature

### Functionality
The AI module extracts structured blood request data from free-form text messages. Users paste messages from social media or chat applications, and the system extracts key parameters required to initialize a blood request.

### Input and Output
- Input: Unstructured natural language string (`{ "text": "Need B+ blood urgently at Rajshahi Medical College" }`).
- Output: Structured JSON payload with extracted parameters:
  ```json
  {
    "bloodGroup": "B+",
    "district": "Rajshahi",
    "hospital": "Rajshahi Medical College",
    "urgency": "URGENT",
    "unitsNeeded": 1
  }
  ```

### Validation and Security
- Output validation is enforced using a strict Zod schema matching the 8 standard blood groups, 64 Bangladesh districts, and urgency levels.
- System prompts are hardened to ignore prompt injection attempts embedded within user text.
- Fallback parsing extracts JSON from markdown-wrapped LLM responses if code blocks are returned.

### Limitations
- The model may omit the district if the hospital name is not recognized or does not mention the geographical district.
- Phone numbers and specific patient names in ambiguous contexts are omitted to prevent hallucination.

### Evaluation Benchmark Results
Directly reproduced from `docs/ai-evaluation.md`:

#### Summary Metrics
| Metric | Value |
| :--- | :--- |
| Total Test Samples | 20 |
| Fully Correct Samples | 20 / 20 (100.0%) |
| Overall Field Accuracy | 57 / 57 (100.0%) |
| Average Response Time | 3622 ms |

#### Per-Field Accuracy
| Field | Tested Cases | Correct Matches | Accuracy |
| :--- | :--- | :--- | :--- |
| bloodGroup | 20 | 20 | 100.0% |
| district | 20 | 20 | 100.0% |
| urgency | 17 | 17 | 100.0% |

#### Failed Cases Analysis
All evaluation samples passed with 100% precision.

---

## 9. Security and Validation

- Input Validation: Every incoming payload is validated against Zod schemas for body, query parameters, and route parameters.
- Session-Based Authentication: Managed by Better Auth using secure HTTP-only cookies and cryptographic session verification.
- Role-Based Access Control: Enforced at router level using `requireRole("ADMIN")`.
- Privacy Protection: Contact phone numbers are stripped from public feeds and only revealed to verified request owners or accepted donors.
- Transactional Integrity: All multi-table updates (e.g., blocking a user and deleting sessions, accepting donations, cancelling requests) execute inside database transactions.
- Rate Limiting: General API requests are throttled at 100 requests per 15-minute window; AI endpoints are throttled at 10 requests per 1-minute window.

---

## 10. Testing

The backend includes test suites covering business logic, compatibility matrices, donor ranking, donation status transitions, AI parsing, and admin moderation.

To run all automated test suites:
```bash
npm test
```

To run tests in watch mode:
```bash
npm run test:watch
```

To execute the AI benchmark evaluation against OpenRouter:
```bash
npm run eval:ai
```

---

## 11. Setup Guide

### Prerequisites
- Node.js v20 or higher
- npm v10 or higher
- PostgreSQL database (e.g., Neon serverless)

### Installation
```bash
cd server
npm install
```

### Environment Variables
Configure `server/.env` based on `server/.env.example`:

| Variable | Purpose | Example |
| :--- | :--- | :--- |
| `PORT` | HTTP server port | `5000` |
| `NODE_ENV` | Application environment | `development` |
| `DATABASE_URL` | Pooled PostgreSQL connection string | `postgresql://user:pass@host/db?sslmode=require` |
| `DIRECT_URL` | Direct PostgreSQL connection string | `postgresql://user:pass@host/db?sslmode=require` |
| `BETTER_AUTH_SECRET` | 32-character secret for Better Auth tokens | `super-secret-random-32-char-string` |
| `BETTER_AUTH_URL` | Base URL of backend server | `http://localhost:5000` |
| `FRONTEND_URL` | Origin URL for CORS configuration | `http://localhost:3000` |
| `OPENROUTER_API_KEY` | API key for OpenRouter inference | `sk-or-v1-...` |
| `OPENROUTER_MODEL` | LLM model identifier | `google/gemini-2.5-flash` |
| `OPENROUTER_TIMEOUT_MS` | AI inference timeout in milliseconds | `30000` |
| `ADMIN_EMAIL` | Default administrator account email | `admin@bloodsync.com` |
| `ADMIN_PASSWORD` | Default administrator account password | `Admin@123456` |
| `DEMO_PASSWORD` | Shared password for seeded demo users | `Demo@123456` |

### Database Migration & Seeding
Apply migrations:
```bash
npx prisma migrate dev
```

Seed initial administrative user:
```bash
npm run seed
```

Seed realistic demo dataset (20 donors, 2 requesters, 4 requests across all statuses):
```bash
npm run seed:demo
```

### Running the Server
Development mode:
```bash
npm run dev
```

Production build and execution:
```bash
npm run build
npm start
```

---

## 12. Demo Credentials

### Administrator Account
- Email: `admin@bloodsync.com`
- Password: `Admin@123456`
- Role: `ADMIN`

### Demo Requesters
- Requester 1: `demo.requester1@bloodsync.test` / `Demo@123456` (Has OPEN and MATCHED requests)
- Requester 2: `demo.requester2@bloodsync.test` / `Demo@123456` (Has FULFILLED and EXPIRED requests)

### Demo Donors
Password for all demo donors: `Demo@123456`

- `demo.donor1@bloodsync.test`: O+, Dhaka, Available, Eligible (Matched on Request 2)
- `demo.donor2@bloodsync.test`: A+, Chittagong, Available, Eligible (Completed on Request 3)
- `demo.donor3@bloodsync.test`: B+, Rajshahi, Available, Eligible
- `demo.donor4@bloodsync.test`: AB+, Mymensingh, Available, Eligible
- `demo.donor5@bloodsync.test`: O-, Khulna, Available, Eligible
- `demo.donor6@bloodsync.test`: A-, Barisal, Available, Eligible
- `demo.donor7@bloodsync.test`: B-, Dhaka, Available, Eligible
- `demo.donor8@bloodsync.test`: AB-, Rangpur, Available, Eligible
- `demo.donor9@bloodsync.test` through `demo.donor12@bloodsync.test`: Various blood groups, Available, Eligible
- `demo.donor13@bloodsync.test`, `demo.donor14@bloodsync.test`: Available, Eligible (> 90 days since donation)
- `demo.donor15@bloodsync.test` through `demo.donor17@bloodsync.test`: Available, Ineligible (< 90 days recovery period)
- `demo.donor18@bloodsync.test` through `demo.donor20@bloodsync.test`: Unavailable (`isAvailable: false`)

---

## 13. Known Limitations and Future Improvements

- Geolocation Precision: Donor ranking relies on district and area string matching. Distance calculation does not currently use latitude and longitude coordinates or route-distance mapping.
- Notification Dispatch: Blood requests do not yet trigger direct SMS or push notifications; notifications are currently tracked via database status polling.
- Rate Limiting Storage: Rate limiting utilizes in-memory tracking, which resets on server restart and is not distributed across multiple server instances.
- Email Verification: Email verification tokens are generated but not dispatched via external SMTP in local development.

---

## 14. Client

Placeholder for frontend web application documentation. The client application will be developed using Next.js / Vite in the `client/` directory and will interface with the backend endpoints documented above.
