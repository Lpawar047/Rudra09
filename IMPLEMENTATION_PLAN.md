# Implementation Plan — Rudra Services Platform

## 🎯 Architecture Overview
Rudra Services is structured into two cleanly decoupled services:
1. **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, React Router v6.
2. **Backend:** Node.js, Express, TypeScript, PostgreSQL (Neon DB with fallback driver), JWT, bcryptjs, SheetJS.

---

## 🛠️ Step-by-Step Execution Plan

### Step 1: Baseline Analysis & Infrastructure Setup
- Verify environment setup (Node.js v24, npm 11).
- Initialize `backend/` package configuration (`package.json`, `tsconfig.json`, `.env.example`).
- Initialize `frontend/` package configuration (`package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.js`).

### Step 2: Database Schema & Migrations (PostgreSQL / Neon)
- Define 11 relational tables with full PK, FK, index, and timestamp constraints:
  1. `users`: Admin, Manager, Employee accounts with hashed passwords.
  2. `customers`: Borrowers' personal, contact, and employment data.
  3. `vehicles`: Registration numbers, model details, status tracking.
  4. `loans`: Financial contract parameters, DPD, overdue balances.
  5. `recovery_cases`: Active collection cases linked to loans.
  6. `case_assignments`: Immutable audit record of case assignments.
  7. `followups`: Logged interactions (calls, visits, responses).
  8. `payments`: Recorded collections (Cash, UPI, NEFT, Cheque).
  9. `excel_uploads`: Uploaded batch logs and execution summaries.
  10. `excel_import_errors`: Row-level data import error logs.
  11. `activity_logs`: System audit trail of all major user operations.
- Implement database pool manager with auto-migration initialization and SQLite fallback for instant zero-config evaluation.

### Step 3: Backend Core & Security Services
- Express application bootstrap with CORS, JSON body parser, file upload middleware (`multer`).
- Authentication controller with JWT signing and password validation.
- Role-based authorization middleware (`requireRole(['ADMIN', 'MANAGER', 'EMPLOYEE'])`).
- Controllers & Services for:
  - Users (CRUD & role filters)
  - Customers & Vehicles
  - Loans & Recovery Cases
  - Case Assignments & History
  - Follow-ups & Payment Collections
  - Dynamic Excel mapping, preview, validation, and UPSERT import engine
  - Analytical reports & dashboard aggregated metrics

### Step 4: Database Seeder Script
- Comprehensive seeder generating realistic Indian vehicle loan collection records:
  - Demo Admin, Manager, and Field Employee users.
  - Realistic customer names, phone numbers, addresses in Mumbai, Delhi, Bengaluru, etc.
  - Vehicle registration numbers (e.g. MH12AB1234, KA01MH9988).
  - Varied loan amounts, DPD values (15 days to 180 days), case priorities, and recovery statuses.
  - Historical field follow-ups and payment receipts.

### Step 5: Frontend Architecture & Design System
- Setup Tailwind CSS theme with professional corporate color palette (Navy Blue, Slate, Emerald Green, Warm Amber, Rose Red).
- Reusable UI primitives:
  - `DataTable` with pagination, sorting, search, and dynamic columns.
  - `StatusBadge` & `PriorityBadge` with clean visual indicators.
  - `Modal` dialogs and confirmation popups.
  - `DashboardCard` metric displays.
  - `FilterPanel` & `SearchBar` components.
  - Toast notification state management.

### Step 6: Frontend Pages Implementation
- **Authentication:** Login with email/password, show/hide password, session persistence, role routing.
- **Admin Portal:**
  - Admin Dashboard (KPIs, status pie/bar charts, team leaderboards, recent activity).
  - Recovery Cases management (search, multi-filter, assign modal, quick status update).
  - Employee & Manager management (add, edit, activate/deactivate).
  - Customer & Vehicle management modules.
  - Assignments view with historical audit log.
  - Excel Upload workspace (drag-and-drop, column auto-mapping preview, error report, confirm import).
  - Comprehensive Reports dashboard with custom date range and filters.
  - Profile & Settings configuration.
- **Manager Portal:**
  - Manager Dashboard (team overview, pending assignments, performance alerts).
  - Recovery Cases (team subset filtering, re-assignment to team members).
  - Follow-ups supervision & Team performance reports.
- **Employee Portal:**
  - Field Dashboard (My pending cases, upcoming follow-up schedule).
  - My Recovery Cases with quick action buttons.
  - Detailed Case Drawer/Page (Customer details, vehicle location, historical notes).
  - Add Follow-up & Record Payment Collection modals.
  - Personal Collection Performance metrics.

### Step 7: End-to-End Testing & Verification
- Verify backend API endpoints with test calls.
- Test authentication flows across ADMIN, MANAGER, EMPLOYEE.
- Perform bulk Excel upload tests with sample files.
- Verify TypeScript compilation across frontend and backend.
