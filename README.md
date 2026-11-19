# Sarkari Admin Desk — Public Sector Recruitment Console

A secure, responsive administrative dashboard and scrutiny workspace built for government recruitment management, notification verification, candidate scrutiny, and publication workflows.

Connected to **[Sarkari API Service](https://github.com/hkbharti77/sarkari-api-service)** backend.

---

## 🌟 Key Features

- **Recruitment Scrutiny Queue**: Multi-tier status transitions (`DRAFT` → `SCRUTINY` → `APPROVED` → `PUBLISHED`).
- **Notification Verification**: PDF notification ingestion, official URL checks, and anti-misinformation attribution.
- **KPI & Analytics Strip**: Real-time overview of active vacancies, pending scrutinies, and published updates.
- **Role-Based Access Control**: Secure login for scrutiny officers, content creators, and administrative managers.
- **Candidate Dossier Review**: Document verification and status logging for candidate applications.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS + Lucide React Icons
- **Animation**: Motion (Framer Motion)
- **API Integration**: REST client communicating with NestJS Backend (`/api/v1`)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or pnpm

### 2. Installation
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file from `.env.example`:
```env
VITE_API_BASE_URL="http://localhost:4000/api/v1"
```

### 4. Running the Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### 5. Production Build
```bash
npm run build
npm run preview
```
