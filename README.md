# AgroMarket

**Farm-to-table marketplace connecting local producers directly with buyers.**

AgroMarket is a full-stack platform where farmers list and sell their products, and consumers browse, order, and track deliveries. It includes a Next.js web app, a FastAPI backend, a React Native mobile app, and a Docker-based deployment stack (nginx + PostgreSQL + Redis).

---

## Features

### Marketplace (All users)
- Browse products with category filters, organic toggle, and search
- View producer profiles and product reviews
- Place orders and simulate card payment (Stripe simulator)

### Producer Dashboard
- List, create, and manage products
- View incoming orders and update their status (Processing → Shipped → Completed)
- Revenue and order analytics

### Buyer
- Shopping cart with quantity management
- Order history with status tracking and invoice PDF download
- Rate completed orders and leave product reviews
- Request refunds on eligible orders

### Admin Dashboard (`/admin`)
- Platform-wide statistics: revenue, orders, users, products
- Full order table with status filtering and search
- Full user directory

### Mobile App (React Native / Expo)
- Full marketplace, cart, orders, and producer dashboard
- Available in English, Greek, German, and French
- Secure token storage via `expo-secure-store`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Web frontend | Next.js 14 (App Router), Tailwind CSS, TypeScript |
| Mobile | React Native, Expo, TypeScript |
| Backend | FastAPI, SQLAlchemy 2, Pydantic v2, Python 3.11 |
| Database | PostgreSQL 15 |
| Cache / Rate limiting | Redis 7, SlowAPI |
| Reverse proxy | nginx 1.25 |
| Auth | JWT (access + refresh tokens), httpOnly cookies, bcrypt |
| Containerisation | Docker, Docker Compose |

---

## Quick Start (Docker)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose)

### 1. Clone and configure environment

```bash
git clone <repo-url>
cd agromarket
cp .env.docker.example .env.docker
# Edit .env.docker — set POSTGRES_PASSWORD and SECRET_KEY to strong random values
```

### 2. Build and start all services

```bash
docker-compose --env-file .env.docker up --build -d
```

This starts five services:
- **nginx** → `http://localhost` (entry point for everything)
- **frontend** → `http://localhost` (proxied by nginx)
- **backend** → `http://localhost/api/v1` (proxied by nginx)
- **db** → PostgreSQL on port 5432 (internal + exposed for debugging)
- **redis** → Redis on port 6379 (internal)

### 3. Seed the database

```bash
./scripts/seed.sh
```

Or manually:

```bash
docker-compose --env-file .env.docker exec backend python seed.py
```

### 4. Open the app

Visit **http://localhost** in your browser.

**Test accounts (after seeding):**

| Role | Email | Password |
|------|-------|----------|
| Buyer | buyer@test.com | Test1234! |
| Producer | producer@test.com | Test1234! |
| Admin | admin@test.com | Admin1234! |

---

## Local Development (without Docker)

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env — set DATABASE_URL and SECRET_KEY
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API docs available at: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
# .env.local already has: NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
npm run dev
```

Open `http://localhost:3000`

### Mobile

```bash
cd mobile
npm install
# For iOS simulator (macOS only):
npx expo start --ios

# For Android emulator:
npx expo start --android

# For physical device (scan QR code with Expo Go app):
npx expo start
```

The mobile app defaults to `http://localhost:8000/api/v1` on iOS simulator and `http://10.0.2.2:8000/api/v1` on Android emulator.

To point it at your Docker stack, create `mobile/.env`:
```
EXPO_PUBLIC_API_URL=http://<your-machine-ip>/api/v1
```

---

## Project Structure

```
agromarket/
├── backend/                  FastAPI application
│   ├── api/v1/routes/        Route modules (auth, products, orders, users, reviews, admin)
│   ├── core/                 Config, JWT auth, password hashing
│   ├── alembic/              Database migrations
│   ├── tests/                Pytest test suite
│   ├── models.py             SQLAlchemy ORM models
│   ├── schemas.py            Pydantic request/response schemas
│   ├── seed.py               Database seeder
│   └── main.py               FastAPI app factory
├── frontend/                 Next.js web application
│   ├── app/                  App Router pages
│   │   ├── auth/             Login and register pages
│   │   ├── orders/           Order list and detail pages
│   │   └── admin/            Admin dashboard
│   ├── components/           Reusable UI components
│   ├── context/              React contexts (Auth, Cart)
│   └── services/             API service layer
├── mobile/                   React Native (Expo) application
│   └── src/
│       ├── screens/          App screens
│       ├── components/       Reusable components
│       ├── context/          Auth and Cart contexts
│       └── services/         API service layer
├── nginx/                    nginx configuration and Dockerfile
├── scripts/                  Utility scripts (seed.sh)
├── docker-compose.yml
├── .env.docker.example       Required env vars template
└── README.md
```

---

## API Reference

Interactive API docs (Swagger UI): `http://localhost:8000/docs`

Key endpoints:

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/auth/register` | — | Register new user |
| POST | `/api/v1/auth/login` | — | Login, returns JWT |
| GET | `/api/v1/auth/me` | Bearer | Current user profile |
| GET | `/api/v1/products/` | — | List products |
| POST | `/api/v1/products/` | PRODUCER | Create product |
| POST | `/api/v1/orders/` | BUYER | Place order |
| GET | `/api/v1/orders/` | Bearer | My orders |
| GET | `/api/v1/admin/stats` | ADMIN | Platform stats |
| GET | `/api/v1/admin/orders` | ADMIN | All orders |

---

## Running Tests

```bash
cd backend
pip install -r requirements-dev.txt
pytest tests/ -v
```

---

## Security Notes

- JWT access tokens expire in 15 minutes; refresh tokens in 7 days
- Refresh token is stored in an httpOnly cookie (not accessible by JavaScript)
- Passwords hashed with bcrypt
- CORS restricted to configured origins only
- nginx rate limits: 5 req/min on auth endpoints, 60 req/min on API
- Security headers: `X-Frame-Options`, `X-Content-Type-Options`, `CSP`, `Referrer-Policy`
- `ENVIRONMENT=production` enables the `secure` flag on the refresh cookie (requires HTTPS)

---

## License

MIT
