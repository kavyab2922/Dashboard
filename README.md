# HROrbit — Employee Engagement Dashboard (frontend)

React + Vite frontend for the HROrbit employee portal. It is designed to work with the Express backend that provides authenticated data, user management, uploads, and role-based content.

## Stack

- React + Vite
- React Router
- Axios
- MUI
- Redux Toolkit + Redux Persist
- Tailwind CSS
- ESLint + Prettier

## Requirements

- Node.js 18.18+ (Node 20 LTS is recommended) and npm
- The backend running and reachable on the configured API URL
- Access to the backend environment variables and any required company network access

## Run locally

Start the backend first, then run the frontend:

```bash
cd ../hr-dashboard-backend
npm install
npm run dev          # API at http://localhost:3000
```

Then in this frontend directory:

```bash
npm install
npm run dev          # UI at http://localhost:5173
```

The frontend reads `VITE_API_URL` from `.env`, which defaults to `http://localhost:3000` unless configured otherwise.

Build with `npm run build`, or preview with `npm run preview`.

## Features

- Dashboard with announcements, events, mood tracking, quick links, and learning suggestions
- HR FAQ assistant and knowledge pages
- Daily games and leaderboards
- Recognition, community, learning hub, and profile management
- Birthday and celebration notifications served from the backend

## Project structure

```text
hr-dashboard-frontend/
├── public/                   # Static assets
├── src/
│   ├── components/
│   │   ├── birthdays/
│   │   ├── chatbot/
│   │   ├── common/
│   │   ├── dashboard/
│   │   ├── games/
│   │   ├── kudos/
│   │   └── layout/
│   ├── context/
│   ├── data/
│   ├── hooks/
│   ├── pages/
│   ├── services/
│   ├── styles/
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
├── .env.example
├── .gitignore
└── README.md
```

