# OfficeVerse — Deployment Guide

Deploy the frontend to **Vercel** and backend to **Render** for free.

---

## Prerequisites
- A [GitHub](https://github.com) account
- A [Vercel](https://vercel.com) account (sign in with GitHub)
- A [Render](https://render.com) account (sign in with GitHub)

---

## Step 1 — Push to GitHub

```bash
cd "Next-Gen HR Portal"

# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit — OfficeVerse HR Portal"

# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/nextgen-hr-portal.git
git branch -M main
git push -u origin main
```

---

## Step 2 — Deploy Backend on Render

1. Go to [render.com](https://render.com) → **New +** → **Web Service**
2. Connect your GitHub account → Select `nextgen-hr-portal` repo
3. Fill in these settings:

   | Field | Value |
   |-------|-------|
   | Name | `officeverse-api` |
   | Root Directory | `backend` |
   | Runtime | `Node` |
   | Build Command | `npm install` |
   | Start Command | `node server.js` |
   | Instance Type | `Free` |

4. Click **Create Web Service**
5. Wait ~2 minutes for deploy
6. Copy your URL: `https://officeverse-api.onrender.com`

---

## Step 3 — Deploy Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo `nextgen-hr-portal`
3. Configure the project:

   | Field | Value |
   |-------|-------|
   | Framework Preset | `Vite` |
   | Root Directory | `frontend` |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |

4. Add **Environment Variable**:
   - Name: `VITE_API_URL`
   - Value: `https://officeverse-api.onrender.com/api`
   *(use your actual Render URL from Step 2)*

5. Click **Deploy**
6. Your live URL: `https://officeverse-hr.vercel.app` 🎉

---

## Step 4 — Connect Frontend URL to Backend (CORS)

1. Go back to Render → Your service → **Environment**
2. Add environment variable:
   - Key: `FRONTEND_URL`
   - Value: `https://officeverse-hr.vercel.app`
   *(use your actual Vercel URL from Step 3)*
3. Click **Save Changes** — Render redeploys automatically

---

## Step 5 — Test the live app

1. Open your Vercel URL
2. Log in as **Arjun Sharma** (employee) or **Meera Nair** (hr-admin)
3. Verify data loads correctly
4. Test API health: `https://officeverse-api.onrender.com/api/health`

---

## Demo Credentials

| User | Role | Password |
|------|------|----------|
| Arjun Sharma | Employee | `arjun123` |
| Meera Nair | HR Admin | `meera123` |

---

## Local Development (unchanged)

```bash
# Terminal 1 — Backend
cd backend && npm install && npm run dev

# Terminal 2 — Frontend
cd frontend && npm install && npm run dev
```

Frontend: http://localhost:3000  
Backend: http://localhost:5000/api/health

---

## Notes

- **Free tier cold starts**: Render free tier spins down after 15 min of inactivity. First request may take ~30 seconds to wake up. This is normal for free hosting.
- **Data persistence**: JSON files reset on Render redeploy. All seed data (employees, kudos, achievements) is always present from the repo.
- **Custom domain**: Both Vercel and Render support custom domains on free plans.
