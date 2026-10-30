import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import { useApp } from './context/AppContext';
import { PageTitle, Panel } from './components/common/UI';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Announcements = lazy(() => import('./pages/Announcements'));
const Events = lazy(() => import('./pages/Events'));
const QuickLinksPage = lazy(() => import('./pages/QuickLinksPage'));
const HRContacts = lazy(() => import('./pages/HRContacts'));
const HRFAQ = lazy(() => import('./pages/HRFAQ'));
const Games = lazy(() => import('./pages/Games'));
const GamePlay = lazy(() => import('./pages/GamePlay'));
const LearningHub = lazy(() => import('./pages/LearningHub'));
const Recognition = lazy(() => import('./pages/Recognition'));
const Community = lazy(() => import('./pages/Community'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const Admin = lazy(() => import('./pages/Admin'));
const Login = lazy(() => import('./pages/Login'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));

// The admin console is only reachable in HR Admin mode (server-authorized).
function RequireHrAdmin({ children }) {
  const { isHrAdmin } = useApp();
  if (!isHrAdmin) return <Navigate to="/" replace />;
  return children;
}

function NotFound() { return <><PageTitle title="Page not found" description="That page isn't part of this demo dashboard."/><Panel><p>Use the navigation to continue exploring the employee hub.</p><a className="btn btn-primary" href="/">Back to dashboard</a></Panel></>; }

function LoadingFallback() {
  return <Panel><p className="muted">Loading page…</p></Panel>;
}

export default function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/register" element={<Navigate to="/login" replace />} />

        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/events" element={<Events />} />
          <Route path="/quick-links" element={<QuickLinksPage />} />
          <Route path="/hr-contacts" element={<HRContacts />} />
          <Route path="/faq" element={<HRFAQ />} />
          <Route path="/games" element={<Games />} />
          <Route path="/games/:gameId" element={<GamePlay />} />
          <Route path="/learning" element={<LearningHub />} />
          <Route path="/recognition" element={<Recognition />} />
          <Route path="/community" element={<Community />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route
            path="/admin"
            element={
              <RequireHrAdmin>
                <Admin />
              </RequireHrAdmin>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}