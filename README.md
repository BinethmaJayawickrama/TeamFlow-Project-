# TeamFlow – Project & Task Management Platform

TeamFlow is a full-stack, role-based project and task management web application designed to help teams collaborate, track progress, manage deliverables, and compile performance logs in real-time.

---

## 🔗 Live Deployment Links

* **Frontend App (Next.js)**: [https://team-flow-project-sigma.vercel.app](https://team-flow-project-sigma.vercel.app)
* **Backend API (Express/Node.js)**: [https://teamflow-project-production-2834.up.railway.app](https://teamflow-project-production-2834.up.railway.app)
* **Database (PostgreSQL)**: Hosted in the cloud on **Supabase**

---

## 📂 Project Directory Structure

```text
TeamFlow-Project-/
├── backend/                  # Express.js REST API Server
│   ├── prisma/               # Prisma schema definition & database seed scripts
│   ├── src/
│   │   ├── controllers/      # Route controllers (Auth, Project, Task, etc.)
│   │   ├── middleware/       # JWT Auth and role-validation guards
│   │   ├── routes/           # Express API endpoints mappings
│   │   ├── services/         # Socket.io notification service & email dispatcher
│   │   └── app.js            # Express API entry file
│   ├── .env.example          # Environment variables template
│   └── package.json
│
├── frontend/                 # Next.js App Router UI Client
│   ├── public/               # Static images and icons
│   ├── src/
│   │   ├── app/              # Next.js Page router folders and layouts
│   │   │   ├── admin/        # System admin panel consoles
│   │   │   ├── auth/         # Login, Register, Password reset forms
│   │   │   ├── member/       # Collaborator checklists, Kanban, and Calendar views
│   │   │   └── pm/           # Project management metrics, rosters, and views
│   │   ├── components/       # Custom buttons, layouts, and modals (e.g. Task Details)
│   │   ├── context/          # React AuthContext and ThemeContext providers
│   │   └── services/         # Axios client and WebSockets configuration
│   └── package.json
```

---

## 🤖 AI Assistance & Tooling

This project was built and refactored with the assistance of **Antigravity by Google DeepMind**. 

### Assisted Areas:
* **Database Replatforming**: Assisted in migrating the database layer from local SQLite to Supabase PostgreSQL, writing compatibility schemas, and configuring connection pooling.
* **WebSocket Integration**: Set up real-time live notification pushes using `socket.io` for status changes and document uploads.
* **Authentication Views**: Refactored Next.js login/registration forms to resolve routing errors and build dynamic workspace selectors.
* **UI Design Optimization**: Implemented color-coded status badges, customized modal layouts, and shifted alignment features.

---

## 🚀 Local Installation & Setup Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **NPM**: v9.0.0 or higher

---

### Step 1: Run the Backend API

1. Navigate to the `backend/` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables by copying `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```
   *Replace `[YOUR-PASSWORD]` with your PostgreSQL database password in the connection strings.*
4. Sync your database schemas:
   ```bash
   npx prisma db push
   ```
5. Seed default mock accounts and timeline projects:
   ```bash
   npm run db:seed
   ```
6. Start the development server:
   ```bash
   npm run dev
   ```
   The backend will listen on **`http://localhost:5000`**.

---

### Step 2: Run the Next.js Frontend

1. Navigate to the `frontend/` folder:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js dev server:
   ```bash
   npm run dev
   ```
   The frontend will run on **`http://localhost:3000`**.

---

## 🔑 Seeded Demo Credentials

Use these seeded accounts to test different roles and permissions immediately:

| Email | Password | Role | Access Level |
| :--- | :--- | :--- | :--- |
| **`admin@teamflow.com`** | `admin123` | **Admin** | System Management, User Account CRUD, Project Directory Audits, Global Logs |
| **`pm@teamflow.com`** | `pm123` | **Project Manager** | Create Projects, Assign Collaborators, Issue Tasks, Monitor Reports |
| **`member@teamflow.com`** | `member123` | **Team Member** | View Assigned Projects/Tasks, Update Statuses, Post Comments, Upload Files |
