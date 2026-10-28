# RUDRA SERVICES — Vehicle Loan Collection & Recovery Management Platform

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon%20Serverless-4169E1.svg)](https://neon.tech/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)]()

**Rudra Services** is an enterprise-grade vehicle loan collection, repossession monitoring, and debt recovery management platform built for Banks, Non-Banking Financial Companies (NBFCs), and field recovery agencies.

The platform streamlines the complete recovery lifecycle: from high-volume Excel portfolio ingestion (5,000+ rows/batch) and territory-based case delegation across the 15 Talukas of Nashik District, to field officer mobile tracking, borrower follow-up logging, repossession status updates, and real-time payment collection reconciliation.

---

## 📑 Table of Contents

1. [Executive Overview & Visual Design](#-executive-overview--visual-design)
2. [System Architecture](#-system-architecture)
3. [Core Relational Data Model](#-core-relational-data-model)
4. [Role-Based Access Control (RBAC)](#-role-based-access-control-rbac)
5. [End-to-End Operational Workflows](#-end-to-end-operational-workflows)
   - [1. High-Performance Bulk Excel Ingestion](#1-high-performance-bulk-excel-ingestion)
   - [2. Case Assignment & Delegation Engine](#2-case-assignment--delegation-engine)
   - [3. Taluka Territory Management (Nashik District)](#3-taluka-territory-management-nashik-district)
   - [4. Field Operations & Follow-up Execution](#4-field-operations--follow-up-execution)
   - [5. Payment Collection & Recovery Tracking](#5-payment-collection--recovery-tracking)
6. [Technology Stack](#-technology-stack)
7. [Directory Structure](#-directory-structure)
8. [Quick Start & Local Setup](#-quick-start--local-setup)
   - [Prerequisites](#prerequisites)
   - [Backend Installation](#1-backend-setup)
   - [Frontend Installation](#2-frontend-setup)
   - [Environment Configuration](#3-environment-configuration)
   - [Database Seeding](#4-database-seeding)
9. [Pre-configured Demo Credentials](#-pre-configured-demo-credentials)
10. [Complete REST API Reference](#-complete-rest-api-reference)
11. [Security, Performance & Indexes](#-security-performance--indexes)
12. [Troubleshooting & FAQs](#-troubleshooting--faqs)

---

## 🎨 Executive Overview & Visual Design

Rudra Services adopts a purpose-built, high-contrast industrial theme tailored for rapid data readability in high-intensity operations and bright outdoor field environments:

* **Primary Dark Background:** Deep Onyx (`#111111`) / Slate Surface (`#1E293B`)
* **High-Visibility Accent:** Golden Safety Yellow (`#FACC15`)
* **Status Signaling Colors:** Emerald Green (`#22C55E` - Recovered/Closed), Amber (`#F59E0B` - In Progress/Promise to Pay), Rose Red (`#EF4444` - Critical/Legal Action)
* **Responsive Layout:** Responsive desktop control room for Admins & Managers; mobile-optimized viewports for field officers on smartphones and tablets.

---

## 🏛️ System Architecture

The platform follows a decoupled, stateless client-server architecture with pooled relational persistence:

```mermaid
graph TD
    subgraph Client ["Client Tier (React 18 + Vite + Tailwind)"]
        UI_A["Admin Control Room (/admin/*)"]
        UI_M["Manager Operations (/manager/*)"]
        UI_E["Field Officer Portal (/employee/*)"]
    end

    subgraph Gateway ["API & Middleware Tier (Express.js + TypeScript)"]
        CORS["CORS & Body Parser (10MB)"]
        AUTH["JWT Authenticator & RBAC Guard"]
        CTRL["Domain Controllers (Cases, Excel, Users, Reports)"]
        INGEST["Chunked Excel Ingestion Pipeline (200 rows/chunk)"]
    end

    subgraph Data ["Persistence Tier (Neon Serverless PostgreSQL)"]
        DB_U[("users & activity_logs")]
        DB_C[("customers & vehicles")]
        DB_L[("loans & recovery_cases")]
        DB_A[("case_assignments & followups")]
        DB_P[("payments & excel_uploads")]
    end

    UI_A -->|HTTPS / REST| CORS
    UI_M -->|HTTPS / REST| CORS
    UI_E -->|HTTPS / REST| CORS

    CORS --> AUTH
    AUTH --> CTRL
    CTRL --> INGEST
    INGEST -->|Parameterized Multi-Row UPSERT| DB_L
    CTRL -->|Connection Pool (pg.Pool)| Data
```

---

## 🗄️ Core Relational Data Model

The database is deployed on **Neon PostgreSQL** with relational integrity, foreign key constraints, cascade triggers, and comprehensive indexing:

| Table | Purpose | Primary Keys / Key Foreign Keys |
| :--- | :--- | :--- |
| `users` | System credentials, assigned roles (`ADMIN`, `MANAGER`, `EMPLOYEE`), contact details, account status | `id` (PK) |
| `customers` | Borrower master records (Full name, phone, alternate phone, address, KYC/Aadhaar) | `id` (PK) |
| `loans` | Credit account parameters (Account No, principal, EMI, overdue amount, DPD, bucket, bank name) | `id` (PK), `customer_id` (FK) |
| `vehicles` | Collateral vehicle details (Reg number, chassis number, engine number, make, model) | `id` (PK), `loan_id` (FK) |
| `recovery_cases` | Active recovery case status, priority, taluka, assigned field officer, total overdue | `id` (PK), `loan_id` (FK), `customer_id` (FK), `assigned_to` (FK) |
| `case_assignments` | Immutable audit ledger tracking delegations, reassignments, timestamps, and notes | `id` (PK), `case_id` (FK), `assigned_by` (FK), `assigned_to` (FK) |
| `followups` | Field encounter records (Call, Visit, Demand Notice, SMS) with outcome & next action dates | `id` (PK), `case_id` (FK), `employee_id` (FK) |
| `payments` | Monetary recovery entries (Cash, UPI, Cheque, NEFT/RTGS), receipt numbers, payment status | `id` (PK), `case_id` (FK), `collected_by` (FK) |
| `excel_uploads` | Upload batch registry (File name, total records, validated, inserted, updated, failed) | `id` (PK), `uploaded_by` (FK) |
| `excel_import_errors`| Granular row-by-row error logs recording exact failure reasons during Excel import | `id` (PK), `upload_id` (FK) |
| `activity_logs` | Security and audit trails capturing create, edit, delete, and assignment operations | `id` (PK), `user_id` (FK) |

---

## 👥 Role-Based Access Control (RBAC)

The application enforces strict three-tier role separation across both frontend navigation guards and backend Express route middlewares (`authenticateToken`, `requireRole`):

| Feature / Capability | Admin | Manager | Field Officer (Employee) |
| :--- | :---: | :---: | :---: |
| **System Dashboard & KPI Aggregates** | Full Access | Team Access | Personal Access |
| **Excel Bulk Upload & Ingestion** | Yes | Yes | No |
| **Create / Delete Recovery Cases** | Yes (Create & Delete) | Yes (Create only) | No |
| **Case Assignment & Reassignment** | Any Staff | Team Staff | No |
| **Taluka Filter & Territory Views** | All 15 Talukas | All 15 Talukas | Assigned Portfolio |
| **Field Follow-up Logging** | Yes | Yes | Yes |
| **Payment Collection Entry** | Yes | Yes | Yes |
| **User & Team Management** | Create / Edit / Deactivate | View Team | View Self |
| **Audit Logs & Detailed Reports** | Yes | Yes | No |
| **Excel / CSV Report Export** | Yes | Yes | No |

---

## 🔄 End-to-End Operational Workflows

### 1. High-Performance Bulk Excel Ingestion
* **Format Compatibility:** Accepts `.xlsx` and `.xls` files up to 10MB.
* **13 Canonical Field Mapping:** Automatically detects and aligns sheet columns with canonical internal attributes:
  1. `Customer Name`
  2. `Mobile Number`
  3. `Address`
  4. `Taluka` (Auto-mapped and normalized to Nashik district list)
  5. `Loan Account Number` *(Unique Business Key)*
  6. `Total Loan Amount`
  7. `Overdue Amount`
  8. `EMI Amount`
  9. `Days Past Due (DPD)`
  10. `Bucket` (e.g., B1, B2, B3, B4, B5, B6, Write-Off)
  11. `Vehicle Registration Number`
  12. `Vehicle Make`
  13. `Vehicle Model`
* **Non-Destructive Upsert:** Existing loan accounts are idempotently updated with latest overdue amounts and DPD without overwriting past assignment history.
* **Batched Ingestion:** Employs 200-row chunking with parameterized queries to ingest 5,000+ records within seconds without memory bloat or pool starvation.
* **Audit & Error Logging:** Every file upload is tracked in `excel_uploads`, and invalid rows (e.g. missing loan account numbers) are logged into `excel_import_errors`.

### 2. Case Assignment & Delegation Engine
* **Direct & Re-assignment:** Admins and Managers can assign unassigned cases or transfer active cases to any active field officer.
* **Assignment Modal:** Features quick employee selection dropdown with live workload counters and assignment rationale notes.
* **Audit History:** Every assignment automatically writes an immutable log to `case_assignments` storing `case_id`, `assigned_by`, `assigned_to`, timestamp, and rationale.
* **Portfolio Isolation:** When a Field Officer logs into `/employee/cases`, they only see cases where `assigned_to = :userId`, protecting organizational privacy.

### 3. Taluka Territory Management (Nashik District)
To optimize field travel routes and regional recovery drives, the platform features a standardized 16-option **Taluka Filter** across all case views:

* **Authorized Talukas (15 + All):**
  1. `All Talukas` (Default view)
  2. `Nashik`
  3. `Igatpuri`
  4. `Trimbakeshwar`
  5. `Dindori`
  6. `Peth`
  7. `Kalwan`
  8. `Surgana`
  9. `Chandwad`
  10. `Deola`
  11. `Baglan (Satana)`
  12. `Malegaon`
  13. `Nandgaon`
  14. `Yeola`
  15. `Niphad`
  16. `Sinnar`
* **Smart Alias Normalization:** The backend utility cleanses variations (e.g., `"Satana"` $\to$ `"Baglan (Satana)"`, `"Trimbak"` $\to$ `"Trimbakeshwar"`, `"Peint"` $\to$ `"Peth"`).
* **Database Optimization:** Backed by a dedicated B-tree index: `CREATE INDEX idx_cases_taluka ON recovery_cases(taluka)`.

### 4. Field Operations & Follow-up Execution
* **Field Officer Dashboard (`/employee/dashboard`):** Real-time summary of assigned active cases, overdue amounts, pending follow-ups, and collected amounts.
* **Case Details Modal (`CaseDetailsModal`):** Complete 360° overview of customer demographics, phone numbers, vehicle specifications, loan balances, and interaction history.
* **Interaction Logging (`/api/followups`):**
  * Interaction Type: `PHONE_CALL`, `FIELD_VISIT`, `LEGAL_NOTICE`, `SMS_REMINDER`
  * Contact Status: `CONTACTED`, `UNREACHABLE`, `ADDRESS_NOT_FOUND`, `REFUSED_TO_PAY`, `PROMISE_TO_PAY`
  * Action Tracking: Promise-to-pay date and follow-up notes.
* **Case Status Lifecycle:** `PENDING` $\to$ `ASSIGNED` $\to$ `IN_PROGRESS` $\to$ `CONTACTED` $\to$ `PROMISE_TO_PAY` $\to$ `RECOVERED` / `CLOSED` / `LEGAL_ACTION`.

### 5. Payment Collection & Recovery Tracking
* **Collection Entry (`/api/payments`):** Officers record recovered amounts directly from the field with receipt number, payment date, and method (`CASH`, `UPI`, `CHEQUE`, `BANK_TRANSFER`).
* **Instant Reconciliation:** The backend automatically logs the payment, recalculates recovered amounts, updates the case recovery percentage, and flags cases for supervisor closure once fully settled.

---

## 🛠️ Technology Stack

### Frontend Client
* **Framework:** React 18.3 (TypeScript)
* **Bundler & Tooling:** Vite 5.3
* **Routing:** React Router DOM v6.23
* **Styling & UI:** Tailwind CSS 3.4, PostCSS, Autoprefixer
* **Icons:** Lucide React (Modern iconography)
* **HTTP Client:** Axios (Configured with request/response interceptors for JWT token injection)

### Backend API Server
* **Runtime:** Node.js (v18.x - v24.x supported)
* **Framework:** Express.js 4.19 (TypeScript)
* **Security & Auth:** JSON Web Tokens (`jsonwebtoken`), Password Hashing (`bcryptjs`), CORS
* **File Processing:** Multer (Multipart/form-data upload handling), SheetJS (`xlsx` v0.18 for Excel parsing)
* **Database Driver:** `pg` (v8.12) with connection pooling and SSL for Neon Serverless

### Persistence & Cloud Infrastructure
* **Database:** Neon Serverless PostgreSQL (`neondb` on AWS `us-east-2`)
* **Fallback Driver:** SQLite3 (`sqlite` / `sqlite3` for offline local unit development)

---

## 📂 Directory Structure

```
Rudra/
├── backend/
│   ├── src/
│   │   ├── config/             # Database connection pool (Neon PostgreSQL & SQLite fallback)
│   │   ├── controllers/        # Express request handlers
│   │   │   ├── assignmentsController.ts
│   │   │   ├── authController.ts
│   │   │   ├── customersController.ts
│   │   │   ├── excelController.ts          # Bulk ingestion & chunked upsert pipeline
│   │   │   ├── followupsController.ts
│   │   │   ├── loansController.ts
│   │   │   ├── paymentsController.ts
│   │   │   ├── recoveryCasesController.ts  # Taluka filtering & case lifecycle
│   │   │   ├── reportsController.ts
│   │   │   ├── usersController.ts
│   │   │   └── vehiclesController.ts
│   │   ├── middleware/         # JWT authentication & requireRole RBAC guards
│   │   ├── routes/             # Express API routing definitions
│   │   ├── utils/              # Taluka normalizers, password hashing, JWT helpers
│   │   ├── app.ts              # Express application setup & middleware assembly
│   │   ├── server.ts           # Server bootstrap & port listener
│   │   └── seed.ts             # Database seeder with realistic test datasets
│   ├── .env.example            # Environment variable template
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── CaseDetailsModal.tsx        # 360-degree case overview modal
│   │   │   ├── AssignCaseModal.tsx         # Quick delegation & reassignment modal
│   │   │   ├── DataTable.tsx               # Paginated, sortable table component
│   │   │   ├── StatusBadge.tsx             # Color-coded status & priority tags
│   │   │   ├── StatsCard.tsx               # Metric cards with trend indicators
│   │   │   └── Navbar.tsx & Sidebar.tsx    # Responsive navigation shell
│   │   ├── context/            # Global React Contexts (AuthContext, ThemeContext)
│   │   ├── layouts/            # Layout shells with navigation sidebars
│   │   ├── pages/              # Portal pages categorized by role
│   │   │   ├── Home.tsx                    # Public landing page
│   │   │   ├── Login.tsx & Register.tsx    # Auth screens
│   │   │   ├── AdminDashboard.tsx          # System-wide KPI dashboard
│   │   │   ├── AdminRecoveryCases.tsx      # Admin case management with Taluka filter
│   │   │   ├── AdminExcelUpload.tsx        # Bulk Excel upload & error log center
│   │   │   ├── AdminAssignments.tsx        # Case delegation console
│   │   │   ├── AdminReports.tsx            # Exportable recovery & agent reports
│   │   │   ├── ManagerDashboard.tsx        # Supervisory operations center
│   │   │   ├── ManagerRecoveryCases.tsx    # Manager case monitoring
│   │   │   ├── EmployeeDashboard.tsx       # Field officer home & pending targets
│   │   │   ├── EmployeeCases.tsx           # Field officer assigned portfolio
│   │   │   ├── EmployeeFollowups.tsx       # Follow-up encounter log
│   │   │   └── EmployeePayments.tsx        # Payment collection entry
│   │   ├── services/           # Axios API services (api.ts, cases.ts, excel.ts, etc.)
│   │   ├── utils/              # Frontend Taluka lists & formatting helpers
│   │   ├── App.tsx             # Central route table & role guards
│   │   └── main.tsx            # Application entrypoint
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── README.md                   # Project documentation
├── IMPLEMENTATION_PLAN.md      # Engineering roadmap
└── TODO.md                     # Active backlog
```

---

## 🚀 Quick Start & Local Setup

### Prerequisites
* **Node.js:** v18.0.0 or higher
* **npm:** v9.0.0 or higher
* **PostgreSQL:** Neon Serverless DB connection string or local PostgreSQL instance

---

### 1. Backend Setup

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Create your `.env` configuration file from the template:
   ```bash
   cp .env.example .env
   ```

4. Verify your `.env` settings (see [Environment Configuration](#3-environment-configuration) below).

5. Populate initial tables and default seed accounts:
   ```bash
   npm run seed
   ```

6. Build and start the backend API server:
   ```bash
   # Development mode with hot-reloading:
   npm run dev

   # Or compile TypeScript and run production build:
   npm run build
   npm run start
   ```
   *The backend will boot on `http://localhost:5000`.*
   *Verify health check at: `http://localhost:5000/api/health`.*

---

### 2. Frontend Setup

1. In a separate terminal, navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install UI dependencies:
   ```bash
   npm install
   ```

3. Configure the frontend environment:
   ```bash
   cp .env.example .env
   ```

4. Launch the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend client will boot on `http://localhost:5173`.*

---

### 3. Environment Configuration

#### Backend (`backend/.env`):
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=rudra_services_super_secret_jwt_key_2026
CORS_ORIGIN=http://localhost:5173
DATABASE_URL="postgresql://<username>:<password>@<neon-host>/neondb?sslmode=require"
```

#### Frontend (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

---

### 4. Database Seeding

To quickly establish an operational state, run the seed script:
```bash
cd backend
npm run seed
```
This sets up:
* The core schema tables and indexes.
* 3 Pre-configured operational staff accounts (Admin, Manager, Field Officer).
* Mock customers, vehicle records, loans, active recovery cases, and historical follow-ups.

---

## 🔐 Pre-configured Demo Credentials

Once seeded, you can sign in immediately at `http://localhost:5173/login`:

| Role | Email Address | Password | Permissions & Scope |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@rudraservices.com` | `admin123` | Unrestricted full system access, user administration, Excel imports, case deletion, system reports. |
| **Manager** | `manager@rudraservices.com` | `manager123` | Team oversight, assigning cases to field officers, monitoring recovery rates, supervisory reports. |
| **Field Officer** | `employee@rudraservices.com` | `employee123` | Field agent workspace: view assigned cases, log customer visits, record collected payments. |

---

## 📑 Complete REST API Reference

All protected endpoints require an `Authorization: Bearer <JWT_TOKEN>` header.

### Authentication & Self
* `POST /api/auth/register` — Register a new employee account (Pending approval).
* `POST /api/auth/login` — Authenticate and receive a JWT access token.
* `GET /api/auth/me` — Retrieve current authenticated profile.

### Recovery Cases & Filtering
* `GET /api/recovery-cases` — Fetch recovery cases (Supports pagination `page`, `limit`, search `search`, `taluka`, `bucket`, `status`, `priority`).
* `GET /api/recovery-cases/:id` — Retrieve full 360° details of a recovery case.
* `POST /api/recovery-cases` — Create a new recovery case *(Admin, Manager)*.
* `PUT /api/recovery-cases/:id` — Update case status, priority, or remarks.
* `DELETE /api/recovery-cases/:id` — Delete a recovery case *(Admin only)*.

### Case Assignments
* `POST /api/assignments` — Assign or reassign a case to a staff member *(Admin, Manager)*.
* `GET /api/assignments` — Fetch assignment logs and delegation history *(Admin, Manager)*.

### Bulk Excel Ingestion
* `POST /api/excel/upload` — Upload `.xlsx`/`.xls` file for header detection & mapping validation *(Admin, Manager)*.
* `POST /api/excel/import` — Execute chunked high-volume upsert into database *(Admin, Manager)*.
* `GET /api/excel/uploads` — List upload history and batch status *(Admin, Manager)*.
* `GET /api/excel/uploads/:id` — Retrieve batch statistics and error log summary *(Admin, Manager)*.
* `DELETE /api/excel/uploads/:id` — Remove an upload batch record *(Admin only)*.
* `DELETE /api/excel/uploads/:id/cases` — Purge cases belonging to a specific batch *(Admin only)*.

### Field Encounters & Follow-ups
* `GET /api/followups` — Retrieve follow-ups for a case or employee.
* `POST /api/followups` — Submit a field visit, call log, or promise-to-pay record.

### Payment Collections
* `GET /api/payments` — Retrieve payment records.
* `POST /api/payments` — Record collection (Cash, UPI, Cheque, Bank Transfer).

### Reports & Analytics
* `GET /api/reports/dashboard` — Fetch KPI aggregate statistics, charts, and recovery rates.
* `GET /api/reports/recovery` — Detailed recovery ledger reports *(Admin, Manager)*.
* `GET /api/reports/employees` — Agent performance and collection metrics *(Admin, Manager)*.
* `GET /api/reports/export-excel` — Export filterable data to Excel `.xlsx` *(Admin, Manager)*.

### User & Team Administration
* `GET /api/users` — List employees and managers *(Admin, Manager)*.
* `POST /api/users` — Create staff account *(Admin only)*.
* `PUT /api/users/:id` — Update user details *(Admin, Manager)*.
* `PUT /api/users/:id/status` — Approve, reject, or suspend user access *(Admin only)*.
* `DELETE /api/users/:id` — Remove staff account *(Admin only)*.

### Health & Monitoring
* `GET /api/health` — Public API health status check.

---

## 🛡️ Security, Performance & Indexes

* **Password Security:** Salted and hashed using `bcryptjs` (10 salt rounds).
* **Injection Prevention:** 100% parameterized SQL queries via `pg` connection pool.
* **Payload Protection:** 10MB payload thresholds on multipart uploads with file extension and MIME validation.
* **Optimized Database Indexes:**
  ```sql
  CREATE INDEX idx_loans_account_no ON loans(loan_account_no);
  CREATE INDEX idx_cases_taluka ON recovery_cases(taluka);
  CREATE INDEX idx_cases_assigned_to ON recovery_cases(assigned_to);
  CREATE INDEX idx_cases_status ON recovery_cases(status);
  CREATE INDEX idx_cases_bucket ON recovery_cases(bucket);
  CREATE INDEX idx_followups_case_id ON followups(case_id);
  CREATE INDEX idx_payments_case_id ON payments(case_id);
  ```

---

## ❓ Troubleshooting & FAQs

### 1. Excel rows upload successfully, but not all show on the cases page
* Check the active **Taluka** or **Bucket** filters on the Recovery Cases page. If a filter is active, only cases matching that filter will display. Select **"All Talukas"** to view all imported records.
* Ensure your Excel sheet includes the `Loan Account Number` column. Rows lacking a loan account number are skipped and logged into `excel_import_errors`.

### 2. CORS Error when connecting to backend
* Ensure `backend/.env` has `CORS_ORIGIN=http://localhost:5173`.
* Ensure you are accessing the frontend at `http://localhost:5173` and not `http://127.0.0.1:5173` (or update `CORS_ORIGIN` to match).

### 3. Neon PostgreSQL SSL Connection Errors
* If connecting to Neon PostgreSQL, ensure the connection string in `backend/.env` has `?sslmode=require`.

---
## 📜 License

Proprietary Software — Copyright © 2026 Rudra Services. All rights reserved. Unauthorized copying, distribution, or modification is strictly prohibited.
