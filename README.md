# 🌌 OfficeVerse — Your Digital Workplace Universe

> *"Not just an HR portal. A culture platform employees actually want to open."*

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://reactjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)](https://nodejs.org)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3-38BDF8?logo=tailwindcss)](https://tailwindcss.com)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-11-FF0055?logo=framer)](https://www.framer.com/motion)

---

## 🎯 Problem Statement

Traditional HR portals are digital filing cabinets — transactional, cold, and abandoned. Employees dread opening them. Policies are buried in PDFs, birthdays pass unnoticed, recognition is a once-a-year formality, and there is no way to understand how the team is actually feeling.

**OfficeVerse answers one question:**
> *"How do we make HR information accessible, engaging, and culture-driven — so employees don't just use the platform, they look forward to it?"*

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm

### Installation & Run

```bash
# 1. Clone the repository
git clone https://github.com/Geethashalini/Next-Gen-HR-Portal.git
cd "Next-Gen-HR-Portal"

# 2. Install backend dependencies
cd backend && npm install

# 3. Install frontend dependencies
cd ../frontend && npm install

# 4. Start both servers
cd .. && bash start.sh
```

**OR start manually:**

```bash
# Terminal 1 — Backend (port 5000)
cd backend && node server.js

# Terminal 2 — Frontend (port 3000)
cd frontend && npm run dev
```

Open **http://localhost:3000** in your browser.

---

## 🔐 Demo Login Credentials

| Name | Username | Password | Role |
|---|---|---|---|
| Arjun Sharma | `arjun.sharma` | `Arjun@123` | Employee / Developer |
| Priya Menon | `priya.menon` | `Priya@123` | Employee / Manager |
| **Meera Nair** | `meera.nair` | `Meera@123` | **HR Admin** |

> 💡 Login as **Meera Nair** to access the HR Admin Portal and Fun Friday management.

---

## 🗂️ Project Structure

```
Next-Gen-HR-Portal/
├── backend/
│   ├── server.js              # Express server
│   ├── routes/                # 13 API route files
│   │   ├── employees.js
│   │   ├── achievements.js
│   │   ├── celebrations.js
│   │   ├── policies.js
│   │   ├── announcements.js
│   │   ├── kudos.js
│   │   ├── feedback.js
│   │   ├── leaves.js
│   │   ├── pulse.js
│   │   ├── analytics.js
│   │   ├── projects.js
│   │   ├── journeys.js
│   │   └── friday.js
│   └── data/                  # 14 JSON data files
│
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── common/        # Avatar, GlobalSearch, NotificationCenter,
│       │   │                  # ProfileMenu, PageLoader, BirthdayCountdown,
│       │   │                  # ProtectedRoute
│       │   └── layout/        # Sidebar, Header, Layout
│       ├── context/
│       │   ├── AuthContext.jsx   # Mock Keycloak SSO
│       │   └── ThemeContext.jsx  # Dark / Light theme
│       ├── pages/             # 17 page components
│       └── services/
│           └── api.js         # All API calls
│
└── start.sh                   # One-command startup script
```

---

## ✨ Features

### 🏠 Dashboard
- Ambient Motion UI — live particle field canvas (55 drifting, connected dots)
- 3D perspective-tilt stat cards responding to mouse position
- Magnetic CTA buttons that attract to cursor
- Animated counter numbers (count up from 0 on load)
- Birthday Countdown Timer with live HH:MM:SS, circular progress ring, digit-flip animation
- "Today For You" personalized daily widget
- Team Pulse mini-widget with animated SVG score ring
- Featured achievements, upcoming celebrations, pinned announcements, recent kudos

### 🔐 Authentication (Keycloak SSO)
- Simulated Keycloak Single Sign-On with 5-step animated token exchange
- Role-based access control (`employee`, `manager`, `hr-admin`)
- Session persisted in localStorage with 8-hour expiry
- Protected routes with auto-redirect to login

### 🏆 Employee Spotlight
- Public achievement cards with likes, categories, and featured badges
- 7 filter categories: Innovation, Leadership, Excellence, Technical Excellence, Business Impact, Culture, Community
- Filter by employee (linked from "My Achievements" in profile)

### 🎉 Celebrations
- Birthdays, Work Anniversaries, Promotions in separate tabs
- Coming Up This Week banner with live countdown chips
- **Send Wishes** — pick from templates or write your own → confetti bursts from that person's card
- Confetti fires from the exact card position (3 staggered bursts)
- Cards expand independently (`items-start` grid)

### 📢 Announcements
- Pinned posts, priority badges, category filters
- Like system, expandable content, time-stamped
- HR Admin can post new announcements that go live instantly

### 📖 Policy Hub
- 8 policies across 6 categories
- Live search + category filter
- Modal reader with version, last updated, read time

### ❤️ Kudos Wall
- Peer-to-peer recognition — no manager needed
- 8 badge types: Hero, Innovator, Star, Mentor, Insights, Culture, Impact, Rising Star
- Points system (50/75/100/150 pts)
- Recognition leaderboard with 🥇🥈🥉 medals
- Like system on kudos cards

### 👥 Employee Directory
- 10 employees with real photos, skills, roles, bios
- Search by name, role, skill, or department
- Profile modal with career stats and skill badges
- "My Profile" from header opens your own card directly

### 📅 Leave Tracker
- Leave balance cards with progress bars (Annual, Sick, WFH)
- Apply leave form with automatic day calculator
- Status badges: Pending / Approved / Rejected
- HR Admin can approve/reject from Admin Portal

### 💬 Feedback
- Anonymous toggle (100% anonymous mode)
- Type picker: Suggestion, Appreciation, Concern, Idea
- Star rating (1–5)
- All submissions visible to HR Admin

### 📊 Analytics
- Engagement trend (5-month line chart)
- Department distribution (pie chart)
- Kudos by category (bar chart)
- Achievements by department (bar chart)
- Most Recognized Employees leaderboard

### 💙 Team Pulse
- Anonymous daily mood check-in (🚀 Thriving / 😊 Good / 😐 Okay / 😔 Rough)
- Live Team Score ring (0–100)
- 7-day trend area chart
- Anonymous notes wall
- **Streak system** — 3 days = 🔥, 5 days = 🏆, 7 days = "Pulse Legend"
- Resets daily — builds genuine daily engagement habit

### 📍 Who's In Today?
- Live office attendance board grouped by department
- Click icons to toggle: In Office / WFH / On Leave / Offline
- Filter by status, persisted in localStorage

### 🗺️ Employee Journey
- Full career timeline per employee: Joined, Promoted, Award, Skill, Anniversary
- **Play Story button** — events animate in one by one (600ms each)
- IntersectionObserver for scroll-triggered reveals
- Key Moment badges, skill certifications

### 🤖 Ask HR (FAQ Chatbot)
- Instant answers to 12 HR topic areas — no AI APIs
- Smart keyword-scoring engine matches best answer
- Typing animation (600–1400ms variable delay)
- Clickable follow-up chips
- Covers: Leave, WFH, Benefits, Insurance, L&D, Performance, Payroll, POSH, Onboarding, Exit

### 🌌 Projects & Teams
- 6 active/completed projects with team allocation
- Milestone tracker, progress bars, tech tags
- Click → detail modal with per-member allocation bars

### 🎮 Fun Friday
**Employee view:**
- Suggest a game (emoji picker, category, description)
- Vote on active polls with live percentage bars
- View past winners with vote breakdown mini-charts
- My Suggestions tracker with status badges

**HR Admin view (Meera only):**
- Approve / Reject / Delete suggestions
- Create poll — select games, set dates, activate
- Close polls, declare winner, archive
- Live vote results

### 🛡️ HR Admin Portal (Role-gated)
- Only visible to `hr-admin` role (Meera Nair)
- **Post Announcement** — goes live instantly for all employees
- **Leave Approvals** — one-click approve/reject with employee details
- **Add Achievement** — recognize any employee, appears on Spotlight immediately
- **View Feedback** — all anonymous submissions, expandable
- **Fun Friday Management** — full suggestion and poll control
- Non-admin users see "Access Restricted" page

### 🎂 Birthday Countdown
- Appears only within 24 hours of logged-in user's birthday
- Live HH:MM:SS timer updating every second (setInterval, auto-cleared on unmount)
- Circular SVG progress ring with `strokeDashoffset` animation
- Digit flip animation via Framer Motion AnimatePresence
- 5 urgency levels: Pink (24h) → Amber (1h) → Orange (10min) → Red (5min)
- Shake animation when < 10 minutes
- Notify Team toggle (mock)
- **Birthday Mode** when timer = 0: triple confetti burst, animated stars, Celebrate button

### 🔍 Global Search (Ctrl+K)
- Searches across: Employees, Achievements, Policies, Announcements, Kudos
- Debounced 220ms, keyboard navigation (↑↓ Enter Esc)
- Recent searches persisted in localStorage
- Hint chips for guided discovery
- Result count in footer

### 🔔 Smart Notification Center
- 7 context-aware notifications based on real app data
- Unread count badge with ping animation
- Portal-rendered (above all content including confetti canvas)
- Mark as read, mark all read
- Scrollable without closing

### 🌗 Dark / Light (Women's Day) Theme
- Toggle with ☀️🌙 button in header
- **Dark mode:** Deep navy/purple glassmorphism
- **Light mode:** Women's Day theme — lavender background, purple/pink accents throughout
- CSS Custom Properties — instant 0.3s transition
- Persisted in localStorage

---

## 🎨 Design System

**Design Language:** Glassmorphism + Ambient Motion

| Element | Implementation |
|---|---|
| Cards | Semi-transparent frosted glass with `backdrop-filter: blur` |
| Background | 3 animated orbs + live particle canvas (55 dots, line connections) |
| Stat Cards | 3D perspective tilt via Framer Motion `useSpring` + `rotateX/Y` |
| Buttons | Magnetic attraction (`useMotionValue` cursor tracking) |
| Transitions | Spring physics (`stiffness: 200, damping: 28`) |
| Entrance | Staggered choreography with `AnimatePresence` |
| Text | Animated gradient shifts on key headings |
| Modals | `createPortal` to `document.body` — never clipped by parent |

---

## 🔧 Tech Stack

| | Technology |
|---|---|
| **Frontend** | React 18, Vite 5, Tailwind CSS 3 |
| **Animation** | Framer Motion 11 |
| **Charts** | Recharts 2 |
| **Backend** | Node.js, Express 4 |
| **Data** | JSON file storage (no external database) |
| **Auth** | Mock Keycloak SSO (localStorage sessions) |
| **Icons** | Lucide React |
| **Notifications** | React Hot Toast |
| **Dates** | date-fns 3 |

---

## 📡 API Endpoints

| Method | Route | Description |
|---|---|---|
| GET/POST | `/api/employees` | Employee directory |
| GET/POST | `/api/achievements` | Achievements + like |
| GET | `/api/celebrations` | Birthdays, anniversaries, promotions |
| GET/POST | `/api/policies` | Policy hub |
| GET/POST | `/api/announcements` | Announcement feed |
| GET/POST | `/api/kudos` | Kudos + leaderboard |
| GET/POST | `/api/feedback` | Anonymous feedback |
| GET/POST/PATCH | `/api/leaves` | Leave management |
| GET/POST | `/api/pulse` | Team pulse check-ins |
| GET | `/api/analytics` | Engagement metrics |
| GET | `/api/projects` | Projects & teams |
| GET | `/api/journeys` | Employee journey timelines |
| GET/POST/PATCH/DELETE | `/api/friday` | Fun Friday suggestions + polls |

---

## 🏅 What Makes OfficeVerse Different

| Other HR Portals | OfficeVerse |
|---|---|
| Static data display | Live interactions — vote, wish, celebrate, pulse |
| Same UI for everyone | Role-based views (employee vs HR admin) |
| No engagement loop | 3 daily hooks: Pulse streak, Kudos leaderboard, Birthday countdown |
| Generic styling | Glassmorphism + Ambient Motion Design |
| No chatbot | Ask HR — 12 HR topics, instant answers |
| No career visibility | Employee Journey — full career storytelling |
| No culture calendar | Fun Friday with full voting + admin management |
| Plain login | Simulated Keycloak SSO with live token animation |
| Single theme | Dark + Women's Day light theme |

---

## 👥 Team

**Team Name:** OfficeVerse

**Hackathon:** Next-Gen HR Portal — Build Challenge

---

## 📄 License

Built for hackathon demonstration purposes.

---

> *"OfficeVerse isn't a tool people tolerate. It's a workplace they open with purpose."* 🌌
