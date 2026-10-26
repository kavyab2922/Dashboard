import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageTitle } from '../components/common/UI';
import WelcomeBanner from '../components/dashboard/WelcomeBanner';
import EventsShowcase from '../components/dashboard/EventsShowcase';
import SummaryCards from '../components/dashboard/SummaryCards';
import MoodSection from '../components/dashboard/MoodSection';
import { DashboardMainGrid } from '../components/dashboard/DashboardWidgets';
import GiveKudosModal from '../components/kudos/GiveKudosModal';
import { useApp } from '../context/AppContext';
import { dataApi, getToken } from '../services/api';

export default function Dashboard() {
  const { sessionVersion, isHrAdmin } = useApp();
  const [kudosOpen, setKudosOpen] = useState(false);

  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const requestToken = getToken();
    setSummaryLoading(true);
    dataApi.dashboard.summary()
      .then((response) => { if (!cancelled && requestToken === getToken()) { setSummary(response.data || null); setSummaryError(''); } })
      .catch((err) => { if (!cancelled && requestToken === getToken()) setSummaryError(err.message || 'Unable to load dashboard summary.'); })
      .finally(() => { if (!cancelled && requestToken === getToken()) setSummaryLoading(false); });
    return () => { cancelled = true; };
  }, [sessionVersion]);

  return (
    <>
      <PageTitle
        eyebrow="YOUR SPACE, YOUR PACE"
        title="Your dashboard"
        description="A thoughtful snapshot of what's happening around you."
        actions={isHrAdmin ? <Link className="btn btn-secondary" to="/admin"><Sparkles size={15}/> Admin console</Link> : null}
      />
      <WelcomeBanner onKudos={() => setKudosOpen(true)} />
      <div className="dashboard-top-row">
        <EventsShowcase />
        <SummaryCards summary={summary} loading={summaryLoading} error={summaryError} />
      </div>
      <MoodSection />
      <DashboardMainGrid summary={summary} summaryLoading={summaryLoading} summaryError={summaryError} />
      <GiveKudosModal open={kudosOpen} onClose={() => setKudosOpen(false)} />
    </>
  );
}
