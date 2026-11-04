# AYO Food Delivery — NestJS + MongoDB Backend API

Production-ready REST API for **AYO Food Delivery** serving Everywhere.

## Tech Stack
- **NestJS** — modular Node.js framework
- **MongoDB + Mongoose** — document database with typed schemas
- **JWT (passport-jwt)** — stateless auth with role-based access
- **Swagger** — auto-generated API documentation at `/api/docs`
- **bcryptjs** — password hashing (12 rounds)
- **class-validator** — request body validation

---

## Quick Start

### Prerequisites
- Node.js ≥ 18
- MongoDB running locally (`mongod`) or a MongoDB Atlas URI

### 1. Install dependencies
```bash
cd backend
npm install
```

### 2. Configure environment
Edit `.env` — especially `MONGODB_URI` and `JWT_SECRET`:
```env
MONGODB_URI=mongodb://localhost:27017/ayo_food_delivery
JWT_SECRET=your_secret_here
PORT=3000
```

### 3. Seed the database
```bash
npm run seed
```
This seeds **8 restaurants**, **19 dishes**, **3 promo codes**, and **4 user accounts**.

### 4. Start the development server
```bash
npm run start:dev
```
API runs at: `http://localhost:3000`  
Swagger docs: `http://localhost:3000/api/docs`

---

## Demo Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Customer | customer@ayo.food | demo1234 |
| Restaurant Owner | restaurant@ayo.food | demo1234 |
| Delivery Agent | courier@ayo.food | demo1234 |
| Admin | admin@ayo.food | admin1234 |

---

## API Endpoints

### Auth — `/api/v1/auth`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | Public | Register new user |
| POST | `/login` | Public | Login, get JWT |
| GET | `/me` | JWT | Get my profile |

### Restaurants — `/api/v1/restaurants`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Public | List all (with filters: search, cuisine, priceLevel, status, featured, sort, page, limit) |
| GET | `/stats` | Public | Platform restaurant stats |
| GET | `/:slug` | Public | Get restaurant by slug |
| POST | `/` | Admin/Owner | Create restaurant |
| PUT | `/:id` | Admin/Owner | Update restaurant |
| PATCH | `/:id/status` | Admin/Owner | Toggle Open/Closed |
| DELETE | `/:id` | Admin | Delete restaurant |

### Dishes — `/api/v1/dishes`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Public | List all (search, category, restaurantId, dietary, popularOnly, sort, page, limit) |
| GET | `/categories` | Public | All dish category names |
| GET | `/restaurant/:restaurantId` | Public | All dishes for a restaurant |
| GET | `/:slug` | Public | Get dish by slug |
| POST | `/` | Admin/Owner | Create dish |
| PUT | `/:id` | Admin/Owner | Update dish |
| PATCH | `/:id/availability` | Admin/Owner | Toggle sold-out |
| DELETE | `/:id` | Admin/Owner | Delete dish |

### Orders — `/api/v1/orders`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | JWT | Place new order |
| GET | `/my` | JWT | My order history |
| GET | `/track/:ref` | Public | Track order by reference |
| GET | `/ref/:ref` | Public | Get full order by ref |
| GET | `/` | Admin/Owner/Courier | List all orders (filterable) |
| PATCH | `/:id/status` | Admin/Owner/Courier | Update order status (lifecycle-validated) |
| PATCH | `/:id/assign-courier` | Admin/Courier | Assign courier to order |
| GET | `/stats/platform` | Admin | Platform revenue & order stats |

### Users — `/api/v1/users`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/profile` | JWT | Get my profile |
| PUT | `/profile` | JWT | Update name/phone/avatar |
| GET | `/addresses` | JWT | Get my saved addresses |
| POST | `/addresses` | JWT | Add a new address |
| DELETE | `/addresses/:id` | JWT | Remove address |
| GET | `/favorites` | JWT | Get my favourite dish IDs |
| POST | `/favorites/:dishId` | JWT | Toggle favourite |
| GET | `/` | Admin | List all users |
| PUT | `/:id/status` | Admin | Suspend/activate user |

### Cart — `/api/v1/cart`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/calculate` | Public | Calculate cart totals |
| POST | `/validate-promo` | Public | Validate a promo code |
| GET | `/promos` | Public | Active promo codes |
| POST | `/promos` | Admin | Create promo code |
| PUT | `/promos/:id` | Admin | Update promo code |
| DELETE | `/promos/:id` | Admin | Delete promo code |

### Couriers — `/api/v1/couriers`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Admin | List all couriers |
| GET | `/stats` | Admin | Fleet statistics |
| GET | `/me` | JWT | My courier profile |
| GET | `/:id` | JWT | Get courier by ID |
| POST | `/` | Admin | Create courier profile |
| PATCH | `/:id/toggle-online` | JWT | Go online/offline |
| PATCH | `/:id/record-delivery` | JWT | Record completed delivery + earnings |
| PUT | `/:id` | JWT | Update courier details |

### Admin — `/api/v1/admin`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/dashboard` | Admin | Full platform stats in one call |

---

## Order Status Lifecycle

```
Pending Acceptance → Preparing → Ready for Pickup → Courier Assigned → Picked Up → On the Way → Delivered
                                                                                               ↘ Cancelled (from any stage)
```

## Production Build
```bash
npm run build
npm start
```
