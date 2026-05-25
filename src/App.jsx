import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Spotlight from './pages/Spotlight';
import Celebrations from './pages/Celebrations';
import Announcements from './pages/Announcements';
import Policies from './pages/Policies';
import Kudos from './pages/Kudos';
import Directory from './pages/Directory';
import Leaves from './pages/Leaves';
import Feedback from './pages/Feedback';
import Analytics from './pages/Analytics';
import Pulse from './pages/Pulse';
import WhosIn from './pages/WhosIn';
import Projects from './pages/Projects';
import Journey from './pages/Journey';
import AskHR from './pages/AskHR';
import Admin from './pages/Admin';
import FunFriday from './pages/FunFriday';

export default function App() {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={<Login />} />

      {/* All protected routes wrapped in Layout */}
      <Route path="/*" element={
        <ProtectedRoute>
          <Layout>
            <Routes>
              <Route path="/"              element={<Dashboard />} />
              <Route path="/spotlight"     element={<Spotlight />} />
              <Route path="/celebrations"  element={<Celebrations />} />
              <Route path="/announcements" element={<Announcements />} />
              <Route path="/policies"      element={<Policies />} />
              <Route path="/kudos"         element={<Kudos />} />
              <Route path="/directory"     element={<Directory />} />
              <Route path="/leaves"        element={<Leaves />} />
              <Route path="/feedback"      element={<Feedback />} />
              <Route path="/analytics"     element={<Analytics />} />
              <Route path="/pulse"         element={<Pulse />} />
              <Route path="/whos-in"       element={<WhosIn />} />
              <Route path="/projects"      element={<Projects />} />
              <Route path="/journey"       element={<Journey />} />
              <Route path="/ask-hr"        element={<AskHR />} />
              <Route path="/admin"         element={<Admin />} />
              <Route path="/fun-friday"    element={<FunFriday />} />
            </Routes>
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}
