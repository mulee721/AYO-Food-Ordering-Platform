# AYO Food Delivery Dashboard

Professional React + Vite + Tailwind CSS dashboard for AYO Food Delivery, fully connected to the NestJS + MongoDB backend.

## Stack
- **React 18** + **React Router 6** — SPA with role-based routing
- **Vite 6** — lightning-fast dev server with API proxy to NestJS
- **Tailwind CSS 3** — utility-first styling with custom navy/brand palette
- **Axios** — API client with JWT interceptors and 401 auto-redirect
- **Recharts** — responsive analytics charts
- **Lucide React** — crisp SVG icons
- **React Hot Toast** — polished notifications

## Four Dashboards

| Role | Path | Features |
|------|------|---------|
| Admin | `/admin` | Platform KPIs, user management, restaurant management, order management, courier fleet, promotions/promos, reports & analytics |
| Restaurant Owner | `/restaurant` | Sales overview, order queue with status transitions, menu management (add/edit/delete dishes), restaurant profile |
| Courier | `/courier` | Online/offline toggle, available order queue, delivery status transitions, earnings tracker |
| Customer | `/customer` | Browse restaurants, dish catalog, cart, checkout, order tracking, favorites, addresses, wallet |

## Quick Start

### 1. Start the backend
```bash
cd ../backend
npm run seed       # seed MongoDB with demo data
npm run start:dev  # starts on http://localhost:3000
```

### 2. Start the dashboard
```bash
cd dashboard
npm install
npm run dev        # starts on http://localhost:5173
```

Open **http://localhost:5173** — you'll be redirected to `/login`.

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@mira.food | admin1234 |
| Restaurant Owner | kalkidan@mira.food | demo1234 |
| Courier | dawit@mira.food | demo1234 |
| Customer | abebe@mira.food | demo1234 |

> Only customers can self-register. Admin/restaurant/courier accounts are created by the admin.

## API Proxy
The Vite dev server proxies `/api` → `http://localhost:3000` so no CORS issues during development.

## Build for Production
```bash
npm run build    # outputs to dist/
npm run preview  # preview the production build
```
