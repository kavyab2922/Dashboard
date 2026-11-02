import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Panel, PanelHeading } from '../common/UI';
import { ChampionsPodium } from '../games/Leaderboard';

/**
 * Compact "Daily Games Champions" widget for the main dashboard. It fetches its
 * own rankings so the rest of the dashboard is never refetched when the board
 * changes, and it renders only server-computed positions.
 */
export default function ChampionsWidget() {
  return (
    <Panel className="champions-widget span-6">
      <PanelHeading
        title="Daily Games Champions"
        subtitle="The current top three employees"
        action={<Link to="/games" className="panel-action">Play now <ArrowRight size={14} /></Link>}
      />
      <ChampionsPodium period="all" compact />
      <Link to="/games" className="champions-widget-link">
        See the full leaderboard and your position <ArrowRight size={14} />
      </Link>
    </Panel>
  );
}
