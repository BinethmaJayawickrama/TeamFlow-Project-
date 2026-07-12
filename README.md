# TeamFlow – Project & Task Management Platform

TeamFlow is a full-stack, role-based project and task management web application designed to help teams collaborate, track progress, manage deliverables, and compile performance logs.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **NPM**: v9.0.0 or higher

---

### Step 1: Run the Backend API

1. Navigate to the `backend/` folder:
   ```bash
   cd backend
   ```
2. Make sure dependencies are installed:
   ```bash
   npm install
   ```
3. Set up your environment variables by copying `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```
   *(By default, this is preconfigured to use a local SQLite database file `dev.db`)*
4. Run database migrations to initialize the tables:
   ```bash
   npx prisma migrate dev --name init
   ```
5. Populate the database with default roles, credentials, projects, and comments using the seed script:
   ```bash
   npm run db:seed
   ```
6. Start the API server:
   ```bash
   npm run dev
   ```
   The backend will start listening on **`http://localhost:5000`**.

---

### Step 2: Run the Next.js Frontend

1. Navigate to the `frontend/` folder:
   ```bash
   cd ../frontend
   ```
2. Make sure dependencies are installed:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   The frontend will start running on **`http://localhost:3000`**.

---

## 🔑 Seeded Demo Credentials

Use these seeded accounts to test different roles and permissions immediately:

| Email | Password | Role | Access Level |
| :--- | :--- | :--- | :--- |
| **`admin@teamflow.com`** | `admin123` | **Admin** | System Management, User Account CRUD, Project Directory Audits, Global Logs |
| **`pm@teamflow.com`** | `pm123` | **Project Manager** | Create Projects, Assign Collaborators, Issue Tasks, Monitor Reports |
| **`member@teamflow.com`** | `member123` | **Team Member** | View Assigned Projects/Tasks, Update Statuses, Post Comments, Upload Files |

---

## 🛠️ Stack & Architecture

### Backend API (`/backend`)
- **Express.js**: Node.js REST API router.
- **Prisma ORM**: Client bindings mapping tables onto the SQLite database engine.
- **JWT & Hashing**: Token authentication with role verification and `bcryptjs` password hashing.
- **Multer**: Configured for storing task file attachments in local directory.

### Frontend App (`/frontend`)
- **Next.js (App Router)**: Fast rendering React framework.
- **Tailwind CSS**: Beautiful, responsive layout and glassmorphism cards.
- **Axios**: API clients containing automatically managed authentication interceptors.
- **Recharts**: Responsive charts showing metrics for dashboard stats.
- **Lucide Icons**: Modern SVG icon sets.
