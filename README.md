# HROrbit — Phase 1 Employee Engagement Dashboard

A standalone, frontend-only React + Vite prototype for an employee-facing HR portal. It is designed to be reviewed independently before UI integration into the existing HROrbit application. This project does **not** include a production backend, database, company SSO, or real employee data.

## Requirements

- Node.js 18.18+ (Node 20 LTS is recommended)
- npm

## Run locally

```bash
npm install
npm run dev
```

Open the URL printed by Vite (normally `http://localhost:5173`). Create a production bundle with `npm run build`, or preview the built bundle with `npm run preview`.

## Included in this prototype

- Responsive employee dashboard with sidebar, page header, global search, notifications and light/dark theme toggle.
- Dashboard welcome area, achievement/kudos/leave summaries, announcements, Team Pulse, upcoming events, quick links, daily game and learning suggestions.
- Announcements and events pages with demo create/edit/delete dialogs and search/filter behavior.
- Quick Links hub; editable demo links from the Admin page. Destinations not supplied by HROrbit are clearly marked as placeholders.
- Quick Connect HR SPOC directory with fictional contacts and safe email actions where configured.
- Predefined HR FAQ chatbot with suggested questions, session history and a fallback response. All answers are sample content, not official company policy.
- Original playable word-association and grid-logic demo games; the game mechanics and visuals are original and do not copy LinkedIn branding or assets.
- Learning Hub with search, filters, saved resources and provider links. Access/certificate terms are labeled conservatively and should be verified before production use.
- Kudos modal, recent recognition, employee community, profile and settings screens.
- Birthday modal when the configured demo employee's birthday matches the current date; dismissal is remembered for the browser session.
- Demo Admin screen for maintaining announcements, events, quick links and HR contacts.
- Separate mock-data modules, shared components, context state, a future API abstraction and reusable styles.

## Demo data and important limitations

- Names and employee data are fictional examples.
- Demo changes are held in browser state and selected preferences use `localStorage`. This is not secure storage and is not suitable for sensitive employee data.
- `src/services/api.js` documents the future API boundary; the prototype currently uses local mock data.
- Internal system links use placeholder destinations until approved company URLs are provided. Do not treat them as working HROrbit integrations.
- HR FAQ answers are sample content; replace them with approved policy content before sharing with employees.
- The Admin role switch is for UI demonstration only. It is not authorization and must not be relied on for security.
- Course availability, pricing and certificate rules can change. Verify provider details before deployment.

## Main project structure

```text
hrobit-dashboard/
├── public/                   # Static assets
├── src/
│   ├── components/
│   │   ├── birthdays/        # Birthday modal
│   │   ├── chatbot/          # FAQ assistant
│   │   ├── common/           # Shared UI primitives
│   │   ├── dashboard/        # Dashboard sections
│   │   └── layout/           # App shell, sidebar, header
│   ├── context/              # Shared demo application state
│   ├── data/                 # Fictional demo data
│   ├── pages/                # Route-level pages
│   ├── services/api.js       # Future API adapter boundary
│   ├── styles/               # Tailwind entry and custom CSS
│   ├── utils/                # Small formatting helpers
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

## Suggested next integration steps

1. Confirm the UI with HR/product stakeholders and replace mock content with approved content.
2. Wire `src/services/api.js` to documented Express endpoints and move state-changing operations behind the backend.
3. Integrate the agreed authentication/SSO model and enforce permissions server-side.
4. Replace placeholder links with verified internal destinations, and review accessibility/security before production release.
