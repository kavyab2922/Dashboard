import EventsShowcase from '../components/dashboard/EventsShowcase';
import StatsColumn from '../components/dashboard/StatsColumn';
import { DashboardMainGrid } from '../components/dashboard/DashboardWidgets';

export default function Dashboard() {
  return (
    <div className="dashboard-redesign">
      <div className="dashboard-page-header">
        <span className="dashboard-page-kicker">Overview</span>
        <h1>Dashboard</h1>
      </div>
      <section className="dashboard-top-row">
        <EventsShowcase />
        <StatsColumn />
      </section>
      <DashboardMainGrid />
    </div>
  );
}
