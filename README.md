# FIFA World Cup 2026 Prediction Website 🏆

A premium, fully responsive, and production-ready football prediction website for the FIFA World Cup 2026 Final (Argentina vs Spain). Built with Next.js, React, Tailwind CSS, TypeScript, and Supabase.

---

## 🚀 Key Features

*   **Live Prediction Dashboard**: Lock-deadline prediction form covering 13 metrics (top scorer, goals, winner, etc.) worth up to 105 points.
*   **Match Center**: Live score feeds, minute tracking, team possession graphs, and goal timelines.
*   **Podium Leaderboard**: Searchable ranks showcasing high-scoring users with customized achievements.
*   **Admin Dashboard**: Overview charts, match detail editors, transaction-safe point recalculation tools, and user account management.
*   **Cross-platform Flags**: High-quality SVG flag rendering across Windows/Mac/Web devices.

---

## 🛠️ Tech Stack

*   **Core**: Next.js 16 (App Router), React 19, TypeScript
*   **Styling**: Tailwind CSS v4, Framer Motion
*   **Database & Auth**: Supabase (PostgreSql with RLS policies), JWT tokens, Bcrypt password hashing
*   **Visual Charts**: Chart.JS, React-Chartjs-2

---

## ⚙️ Project Setup

### 1. Database Migrations
Run the migration script to setup the schema on your remote Supabase instance:
```bash
node run-migration.js
```

### 2. Run the Development Server
Install dependencies and run the client:
```bash
npm install
npm run dev
```

### 3. Initialize & Seed Database
Navigate to the following route in the browser after booting the server to insert the match record and create the default admin account:
`http://localhost:3000/api/seed`

---

## 🔐 Administrator Access
*   **Username**: `admin`
*   **Password**: `AdminPassword123!`
*   *Accessible via the `Admin Panel` button in the navigation header once authenticated.*
