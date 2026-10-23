import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Announcements from './pages/Announcements';
import Events from './pages/Events';
import QuickLinksPage from './pages/QuickLinksPage';
import HRContacts from './pages/HRContacts';
import HRFAQ from './pages/HRFAQ';
import Games from './pages/Games';
import LearningHub from './pages/LearningHub';
import Recognition from './pages/Recognition';
import Community from './pages/Community';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Admin from './pages/Admin';
import Login from './pages/Login';
import { PageTitle, Panel } from './components/common/UI';
import { useApp } from './context/AppContext';

function NotFound() {
  return (
    <>
      <PageTitle title="Page not found" description="That page isn't part of this dashboard." />
      <Panel>
        <p>Use the navigation to continue exploring the employee hub.</p>
        <a className="btn btn-primary" href="/">Back to dashboard</a>
      </Panel>
    </>
  );
}

function ProtectedLayout() {
  const { token, loading } = useApp();
  if (loading) {
    return <div className="app-boot">Loading your workspace…</div>;
  }
  if (!token) return <Navigate to="/login" replace />;
  return <AppLayout />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="/dashboard" element={<Navigate to="/" replace />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/events" element={<Events />} />
        <Route path="/quick-links" element={<QuickLinksPage />} />
        <Route path="/hr-contacts" element={<HRContacts />} />
        <Route path="/faq" element={<HRFAQ />} />
        <Route path="/games" element={<Games />} />
        <Route path="/learning" element={<LearningHub />} />
        <Route path="/recognition" element={<Recognition />} />
        <Route path="/community" element={<Community />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
