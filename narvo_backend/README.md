# 🛒 Secure E-Commerce API

A highly secure, scalable REST API built with **Node.js**, **Express.js**, and **MongoDB (Mongoose)**.

---

## 📁 Project Structure

```
src/
├── config/
│   ├── db.js              # MongoDB connection
│   ├── cloudinary.js      # Cloudinary image upload helpers
│   └── mailer.js          # Nodemailer SMTP transport
├── models/
│   ├── Admin.js           # Admin schema (bcrypt, lockout)
│   ├── User.js            # Google OAuth user schema
│   ├── Product.js         # Product schema
│   ├── Order.js           # Order schema with status history
│   └── Transaction.js     # Ledger (IN/OUT) schema
├── controllers/
│   ├── authController.js      # Google OAuth + Admin login
│   ├── productController.js   # CRUD products (public + admin)
│   ├── orderController.js     # Checkout + order management
│   ├── adminController.js     # Finance/ledger controllers
│   └── marketingController.js # Email broadcast controller
├── routes/
│   ├── index.js           # Central router
│   ├── authRoutes.js
│   ├── productRoutes.js
│   ├── orderRoutes.js
│   └── adminRoutes.js
├── middlewares/
│   ├── requireAuth.js     # User JWT verification
│   ├── requireAdmin.js    # Admin JWT verification (separate secret)
│   ├── rateLimiter.js     # Rate limiting configs
│   ├── sanitize.js        # NoSQL injection prevention
│   └── errorHandler.js    # Global error handler + AppError class
├── services/
│   └── emailQueue.js      # Batch email broadcasting service
├── utils/
│   ├── jwtToken.js        # JWT sign/verify (separate secrets per role)
│   └── hash.js            # bcrypt helpers
└── server.js              # App entry point
scripts/
└── createAdmin.js         # One-time admin seeder
```

---

## ⚙️ Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Fill in all values in .env
```

### 3. Create first admin
```bash
ADMIN_USERNAME=myadmin ADMIN_PASSWORD=securepass123 node scripts/createAdmin.js
```

### 4. Start the server
```bash
# Development
npm run dev

# Production
npm start
```

---

## 🔐 Security Architecture

### JWT Role Separation
- **Users** → signed with `JWT_SECRET`, audience: `ecommerce-user`, type claim: `user`
- **Admins** → signed with `JWT_ADMIN_SECRET`, audience: `ecommerce-admin`, type claim: `admin`
- Cross-contamination is **impossible**: a user token will throw at the admin middleware and vice versa.

### IDOR Prevention
- `GET /api/orders/me` always queries `{ userId: req.user.id }` — the ID comes from the verified JWT, never from request body or query params.

### NoSQL Injection Prevention
- `express-mongo-sanitize` strips keys containing `$` or `.` from all request inputs globally.

### Brute-Force Protection
- Admin login: **5 requests / 15 minutes** per IP + **account lockout** after 5 failed attempts.
- Checkout: **3 requests / 1 minute** per IP.
- All routes: **100 requests / 15 minutes** standard limit.

### Atomic Stock Deduction
- Checkout uses a **MongoDB session + transaction** with `{ stock: { $gte: quantity } }` guard to prevent race conditions and overselling.

---

## 📡 API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/google/callback` | None | Exchange Google ID Token for app JWT |
| POST | `/api/management-portal-x1/login` | None | Hidden admin login |

### Products (Public)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/products` | None | List active products (paginated) |
| GET | `/api/products/:id` | None | Get single product |

### Orders (User)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/orders/checkout` | User JWT | Place a COD order |
| GET | `/api/orders/me` | User JWT | Get my orders (IDOR-safe) |

### Admin — Products
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/products` | Admin JWT | List all products |
| POST | `/api/admin/products` | Admin JWT | Create product |
| PUT | `/api/admin/products/:id` | Admin JWT | Update product |
| DELETE | `/api/admin/products/:id` | Admin JWT | Soft-delete product |

### Admin — Orders
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/orders` | Admin JWT | List all orders |
| PUT | `/api/admin/orders/:id` | Admin JWT | Update order status (auto-ledger on Delivered) |

### Admin — Finance
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/admin/finance/expense` | Admin JWT | Record an expense (OUT) |
| GET | `/api/admin/finance/report` | Admin JWT | Financial summary + transaction list |

### Admin — Marketing
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/admin/marketing/broadcast` | Admin JWT | Send bulk email to all users |

---

## 📧 Email Broadcast
Emails are sent in **batches of 50** with a **2-second delay** between batches via `services/emailQueue.js`. The HTTP response is returned immediately (202 Accepted) — the queue runs in the background.

---

## 🔧 Health Check
```
GET /api/health
```
Returns server status and uptime.
