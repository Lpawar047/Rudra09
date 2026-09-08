# RUDRA SERVICES — Vehicle Loan Collection & Recovery Management Platform

Rudra Services is a full-stack, enterprise-grade vehicle loan collection and recovery management platform designed for banks, NBFCs, and financial recovery agencies. It manages customers, vehicle recovery cases, employee assignments, field follow-ups, payment collections, performance metrics, reports, and bulk Excel data imports.

---

## 🌟 Key Features

* **Role-Based Access Control (RBAC):**
  * **Admin:** Full system control, employee/manager management, customer & vehicle oversight, case assignment, Excel data upload/imports, reports, system settings, activity logs.
  * **Manager:** Team management, case assignment, monitoring field employees, updating recovery status, performance viewing, follow-up supervision.
  * **Employee:** Mobile-responsive workspace for assigned recovery cases, customer details, adding follow-ups, recording payment collections, tracking personal performance.

* **Smart Bulk Excel Imports:**
  * Support for `.xlsx` and `.xls` formats.
  * Flexible column header auto-detection & field mapping layer.
  * Real-time preview, duplicate detection, validation breakdown, error detail logging.
  * Non-destructive database updates using `UPSERT` logic keyed on `Loan Account Number`.

* **Comprehensive Case & Follow-up Lifecycle:**
  * Statuses: `PENDING`, `ASSIGNED`, `IN_PROGRESS`, `CONTACTED`, `PROMISE_TO_PAY`, `RECOVERED`, `CLOSED`, `UNABLE_TO_CONTACT`, `LEGAL_ACTION`.
  * Priorities: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`.
  * Full audit trial of case assignments and reassignment history.
  * Field follow-up logging (Phone Call, Visit, SMS, Email) with contact result tracking.

* **Payment & Recovery Tracking:**
  * Secure collection entry (Cash, UPI, Bank Transfer, Cheque).
  * Auto-calculation of recovery percentages, total outstanding, and collected amounts.

* **Real-Time Analytics & Reporting:**
  * Dashboard metrics with charts for recovery trends, status distribution, and team leaderboards.
  * Filterable reporting engine by Date, Employee, Manager, Location, and Status.

---

## 🛠️ Technology Stack

* **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide React, React Router v6
* **Backend:** Node.js, Express.js, TypeScript, JWT (JSON Web Tokens), bcryptjs, Multer, SheetJS (`xlsx`)
* **Database:** PostgreSQL / Neon PostgreSQL (with `pg` connection pool and fallback SQLite driver for offline dev)

---

## 📂 Project Structure

```
rudra-services/
├── backend/
│   ├── src/
│   │   ├── config/         # Environment & database connection pool
│   │   ├── controllers/    # API endpoint handlers
│   │   ├── middleware/     # JWT authentication & RBAC authorization
│   │   ├── models/         # Database models & queries
│   │   ├── routes/         # Express API routes
│   │   ├── services/       # Business logic & Excel parser engine
│   │   ├── utils/          # Password hashing, JWT helpers, loggers
│   │   ├── validators/     # Request payload validators
│   │   ├── types/          # Shared TypeScript interfaces
│   │   ├── seed.ts         # Database seeder with realistic Indian dummy data
│   │   ├── app.ts          # Express application setup
│   │   └── server.ts       # Server entrypoint
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI (DataTable, Modal, StatusBadge, Cards, etc.)
│   │   ├── layouts/        # Layout wrappers (Sidebar, Topbar, Responsive Nav)
│   │   ├── pages/          # Auth, Admin, Manager, and Employee view pages
│   │   ├── services/       # Centralized Axios API service layer
│   │   ├── context/        # Auth & Application State context
│   │   ├── types/          # Frontend TypeScript definitions
│   │   ├── App.tsx         # Main router setup with protected routes
│   │   └── main.tsx        # React root entrypoint
│   ├── .env.example
│   └── package.json
│
├── README.md
├── IMPLEMENTATION_PLAN.md
└── TODO.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
* Node.js v18+
* npm or yarn
* PostgreSQL / Neon Database URL (Optional: SQLite local fallback supported for immediate testing)

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env to set your DATABASE_URL, PORT (default: 5000), and JWT_SECRET
npm run seed     # Populate database with realistic demo data
npm run dev      # Start Node.js backend server on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev      # Start Vite dev server on http://localhost:5173
```

---

## 🔐 Default Demo Credentials

Once the backend is seeded (`npm run seed`), you can log in with any of the pre-configured accounts:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@rudraservices.com` | `admin123` | Full System Access |
| **Manager** | `manager@rudraservices.com` | `manager123` | Team & Case Management |
| **Employee** | `employee@rudraservices.com` | `employee123` | Field Collections & My Cases |

---

## 📑 API Endpoints Summary

* `POST /api/auth/login` - Authenticate user & return JWT token
* `GET /api/auth/me` - Get current authenticated user profile
* `GET /api/recovery-cases` - Fetch cases (filtered by role & permissions)
* `POST /api/recovery-cases` - Create recovery case
* `PUT /api/recovery-cases/:id` - Update case details
* `POST /api/assignments` - Assign / Reassign cases to staff
* `POST /api/followups` - Log field follow-up
* `POST /api/payments` - Record collection payment
* `POST /api/excel/upload` - Upload Excel file for parsing
* `POST /api/excel/validate` - Validate sheet headers & rows
* `POST /api/excel/import` - Bulk upsert records into PostgreSQL
* `GET /api/reports/dashboard` - Get key dashboard performance indicators

---

## 🛡️ Security & Compliance

* Hashed passwords using `bcryptjs` with salt rounds.
* Stateless JWT authentication with standard bearer tokens.
* Parameterized SQL queries preventing SQL Injection attacks.
* Strict Role-Based Access Control (RBAC) middleware verifying user authority per route.
