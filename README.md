# Supplyra ERP

<div align="center">

**Modern Web-Based ERP System for Integrated Business Management**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![SvelteKit](https://img.shields.io/badge/SvelteKit-2.21-FF3E00?logo=svelte)](https://kit.svelte.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

</div>

---

## 📋 Description

**Supplyra ERP** is a modern Enterprise Resource Planning (ERP) system built with the latest web technologies. This system is designed to help companies manage various business aspects in an integrated manner, from project management, finance, HR, to reporting.

## ✨ Main Features

### 🎯 Core Management

- **Real-time Dashboard** - Business statistics and analytics with interactive chart visualizations.
- **Project Management** - Manage projects with Kanban boards, timelines, and progress tracking.
- **Task Management** - Task management system with drag-and-drop and real-time notifications.
- **Client Management** - Integrated client database with transaction history.
- **Contact Management** - CRM system for managing business relations.

### 💰 Finance

- **Invoice & Billing** - Generate and manage invoices with professional templates.
- **Expense Tracking** - Recording and categorization of expenses.
- **Financial Reporting** - Comprehensive financial reports (P&L, Cash Flow, etc.).
- **Budget Management** - Project budget planning and monitoring.

### 👥 Human Resources

- **Employee Management** - Complete employee database with profiles.
- **Attendance System** - Presence and timesheet system.
- **Career Development** - Career management and performance reviews.
- **Leave Management** - Leave/permit requests and approvals.

### 📊 Reporting & Analytics

- **Custom Reports** - Generate reports according to needs.
- **Export Data** - Export to Excel, PDF, and other formats.
- **Advanced Analytics** - Trend and profitability analysis.
- **Real-time Notifications** - Server-Sent Events (SSE) based notifications.

### 🔧 Additional Features

- **Multi-language Support** - Internationalization with Paraglide.
- **Role-based Access Control** - Role-based permission system.
- **File Management** - Upload and manage files (S3 or local storage).
- **Email Integration** - Automated email notifications.
- **Activity Logs** - Audit trail for all system activities.
- **News & Pages** - Simple CMS for internal content.

## 🛠️ Technology Stack

### Frontend

- **Framework**: SvelteKit 2.21 + Svelte 5
- **Styling**: Tailwind CSS 4.1 + Tailwind Variants
- **UI Components**: Bits UI, Lucide Icons
- **Forms**: Superforms + Formsnap + Zod
- **Charts**: Chart.js
- **Rich Text**: Quill Editor
- **File Upload**: FilePond
- **Drag & Drop**: svelte-dnd-action

### Backend

- **Runtime**: Node.js 20
- **Database**: PostgreSQL (via postgres-js)
- **ORM**: Drizzle ORM 0.45
- **Cache**: Redis + ioredis
- **Queue**: BullMQ
- **Authentication**: Custom (Argon2 + Oslo)
- **Email**: Nodemailer
- **Storage**: AWS S3 / Local

### DevOps & Tools

- **Build Tool**: Vite 6
- **Package Manager**: npm
- **Linting**: ESLint 9 + Prettier
- **Testing**: Vitest + Playwright
- **Type Checking**: TypeScript 5.8
- **Containerization**: Docker + Docker Compose
- **Orchestration**: Kubernetes
- **CI/CD**: GitHub Actions ready

## 🚀 Quick Start

### Prerequisites

- Node.js 20 or higher
- PostgreSQL
- Redis (optional)
- npm

### Installation

1. **Clone repository**

   ```bash
   git clone <repository-url>
   cd supplyra
   ```

2. **Install dependencies**

   ```bash
   npm install --legacy-peer-deps
   ```

3. **Setup environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` file and adjust configuration:

   ```env
   # Database & Auth
   DATABASE_URL="postgresql://postgres.[YOUR_PROJECT_REF]:[YOUR_PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"
   PASSWORD_DEFAULT="mysecretpassword"

   # Redis Configuration
   REDIS_URL="redis://localhost:6379"

   # Email Configuration
   MAIL_HOST=sandbox.smtp.mailtrap.io
   MAIL_PORT=2525
   MAIL_USERNAME=your-username
   MAIL_PASSWORD=your-password

   # Storage Configuration (S3 or Local)
   STORAGE_DRIVER=local
   AWS_ACCESS_KEY_ID=minioadmin
   AWS_SECRET_ACCESS_KEY=minioadmin
   AWS_BUCKET_NAME=supplyra
   AWS_ENDPOINT=http://localhost:9005

   # VAPID Keys (for Web Push)
   VAPID_SUBJECT="mailto:your-email@example.com"
   VAPID_PRIVATE_KEY=""
   PUBLIC_VAPID_KEY=""
   ```

4. **Setup database**

   ```bash
   npm run db:push
   ```

5. **Seed database (optional)**

   ```bash
   npm run db:seed
   ```

6. **Run development server**

   ```bash
   npm run dev
   ```

   Application will run at `http://localhost:5173`

## 📦 NPM Scripts

| Command              | Description                      |
| -------------------- | -------------------------------- |
| `npm run dev`        | Run development server           |
| `npm run build`      | Build for production             |
| `npm run preview`    | Preview production build         |
| `npm run check`      | Type checking & validation       |
| `npm run lint`       | Lint code with ESLint & Prettier |
| `npm run format`     | Format code with Prettier        |
| `npm run test`       | Run unit tests                   |
| `npm run test:unit`  | Run unit tests (watch mode)      |
| `npm run db:push`    | Push schema to database          |
| `npm run db:migrate` | Run migrations                   |
| `npm run db:studio`  | Open Drizzle Studio              |
| `npm run db:seed`    | Seed database                    |

## 🤝 Contribution

This project is open for contributions.

## 📄 License

**MIT License**

© 2024 Supplyra Team. All rights reserved.

Licensed under the MIT License. See [LICENSE](./LICENSE) for details.
