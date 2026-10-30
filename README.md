# HROrbit — Employee Engagement Dashboard (frontend)

React + Vite frontend for the HROrbit employee portal. It is **not** standalone: all data, sign-in and uploads go through the Express backend in [`../Dashboard-backend`](../Dashboard-backend), which stores data in PostgreSQL (schema `hcm`) and files in S3.

## Requirements

- Node.js 18.18+ (Node 20 LTS is recommended) and npm
- The backend running and reachable (see below)
- Network access to the PostgreSQL host in the backend `.env` (on the office network or VPN)

## Run locally

Start the backend first:

```bash
cd ../Dashboard-backend
npm install
npm run dev          # http://localhost:3000, API under /api
```

The backend reads its settings from `Dashboard-backend/.env` (database, JWT secret, S3, Redis, sign-in options). On startup it runs `src/db/initDb.js`, which creates any missing `hcm.*` tables and **seeds demo content into empty tables**. Point it only at a database where that is acceptable.

Then start the frontend:

```bash
npm install
npm run dev          # http://localhost:5173
```

The frontend calls `VITE_API_URL`, which defaults to `http://localhost:3000`. Set it in a `.env` file here when the backend runs elsewhere, and add the frontend's origin to the backend's `ALLOWED_ORIGINS`.

Build with `npm run build`, or preview the build with `npm run preview`.

## Sign-in and access

- **Email and password.** The backend checks credentials in this order:
  1. The HROrbit portal (`HRORBIT_BASE_URL`).
  2. The HROrbit dev Keycloak realm (`KEYCLOAK_*`).
  3. Local passwords in `hcm.user_credentials` or `hcm.employees.password_hash`.

  Only `@simplify3x.com` emails are accepted.
- **Microsoft Entra SSO** (optional). This is enabled when the `SSO_*` settings are filled in.
- **Network restriction.** Sign-in is only allowed from the IPs and ranges in `ALLOWED_IP_RANGES`.
- **Sessions.** Sessions are JWTs, stored by the frontend in `localStorage`.
- **HR Admin.** Admin access is granted server-side to the emails in `HR_ADMIN_EMAILS`. The role switch in the UI only toggles between modes the account already has.

## Features

- **Dashboard:** welcome banner, announcements, events, Team Pulse and mood, recent kudos, quick links, daily games champions and learning suggestions.
- **Announcements and Upcoming events:** list and month views, plus an event details pop-up. HR Admins can create and edit them, including cover photos up to 10 MB.
- **Daily games:** Mini Sudoku, Quiz, Word Quest and Trivia, with server-validated scoring, hints, streaks and a leaderboard.
- **Other pages:** Kudos and recognition, Quick Connect (HR contacts), HR FAQ assistant, Learning Hub, Community, and Profile with photo and cover uploads up to 5 MB.
- **Birthday and celebration notifications.** The notification centre is served by the backend.

## Content to review before production

- Tables seeded by `initDb.js` (kudos, events, quick links and so on) contain **sample content**, not real company data.
- HR FAQ answers are sample content. Replace them with approved policy text.
- Quiz, Trivia, Word Quest and Sudoku content comes from public APIs (opentdb.com, the-trivia-api.com, datamuse.com and a Sudoku API), with built-in fallbacks.
- Verify Learning Hub course availability, pricing and certificate terms with the providers.

## Project structure

```text
Dashboard/
├── public/                   # Static assets
├── src/
│   ├── components/
│   │   ├── birthdays/        # Birthday modal
│   │   ├── chatbot/          # HR FAQ assistant
│   │   ├── common/           # Shared UI primitives (Modal, Panel, pickers…)
│   │   ├── dashboard/        # Dashboard sections
│   │   ├── games/            # Daily game boards
│   │   ├── kudos/            # Kudos card and modal
│   │   └── layout/           # App shell, sidebar, header
│   ├── context/AppContext.jsx # Session, role and data loading
│   ├── data/                 # In-app guide content for the assistant
│   ├── hooks/                # Shared React hooks
│   ├── pages/                # Route-level pages
│   ├── services/api.js       # Authenticated client for the backend API
│   ├── styles/               # Tailwind entry and custom CSS
│   ├── utils/                # Formatting helpers
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```
