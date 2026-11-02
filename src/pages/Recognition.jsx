import { useState } from 'react';
import { AlertCircle, Award, Gift, Heart, Lightbulb, RefreshCw, Send, Sparkles, Star, Trophy, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import GiveKudosModal from '../components/kudos/GiveKudosModal';
import KudosCard from '../components/kudos/KudosCard';
import { Button, PageTitle, Panel, PanelHeading, Tag } from '../components/common/UI';

export default function Recognition() {
  const { kudos, kudosState, setToast } = useApp();
  const [open, setOpen] = useState(false);

  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const kudosThisMonth = kudos.filter((item) => item.date && item.date.startsWith(thisMonth)).length;
  const peopleCelebrated = new Set(kudos.map((item) => item.toEmployeeId || item.to).filter(Boolean)).size;

  const retry = () => {
    kudosState.refresh().catch((err) => setToast(err.message || 'Unable to load the kudos feed.'));
  };

  return (
    <>
      <PageTitle
        eyebrow="NOTICE THE GOOD, SHARE THE GOOD"
        title="Kudos & recognition"
        description="A space to celebrate effort, care and the wins we create together."
        actions={<Button onClick={() => setOpen(true)}><Heart size={15}/> Give Kudos</Button>}
      />

      <div className="recognition-hero">
        <div className="recognition-hero-copy">
          <Tag tone="rose">A LITTLE APPRECIATION GOES A LONG WAY</Tag>
          <h2>Celebrate the people who make work better.</h2>
          <p>Give a teammate a shout-out and add a little appreciation to their day.</p>
          <Button onClick={() => setOpen(true)}><Gift size={16}/> Send appreciation</Button>
        </div>
        <div className="recognition-hero-art" aria-hidden="true">
          <div className="recognition-medal medal-a"><Award size={25}/></div>
          <div className="recognition-medal medal-b"><Heart size={23} fill="currentColor"/></div>
          <div className="recognition-medal medal-c"><Star size={21} fill="currentColor"/></div>
          <div className="recognition-art-orbit" />
          <span className="recognition-art-spark">✦</span>
        </div>
      </div>

      <div className="recognition-summary-grid">
        <Panel className="recognition-summary-card">
          <span className="recognition-summary-icon icon-rose"><Heart size={18}/></span>
          <div>
            <strong>{kudosState.loading ? '—' : kudosThisMonth}</strong>
            <p>Kudos shared this month</p>
            <small>Recent peer appreciation</small>
          </div>
        </Panel>
        <Panel className="recognition-summary-card">
          <span className="recognition-summary-icon icon-purple"><Trophy size={18}/></span>
          <div>
            <strong>{kudosState.loading ? '—' : kudos.length}</strong>
            <p>Recognition moments</p>
            <small>Across the appreciation feed</small>
          </div>
        </Panel>
        <Panel className="recognition-summary-card">
          <span className="recognition-summary-icon icon-blue"><Users size={18}/></span>
          <div>
            <strong>{kudosState.loading ? '—' : peopleCelebrated}</strong>
            <p>People celebrated</p>
            <small>Teammates recognized so far</small>
          </div>
        </Panel>
      </div>

      <div className="recognition-content-grid">
        <Panel className="recognition-feed-panel">
          <PanelHeading
            title="Appreciation feed"
            subtitle="Good things are worth sharing"
            action={<Tag tone="mint">{kudosState.loading ? 'Loading' : `${kudos.length} kudos`}</Tag>}
          />

          {kudosState.loading ? (
            <div className="kudos-skeleton-list" role="status" aria-label="Loading kudos feed">
              {[0, 1, 2].map((item) => (
                <div className="kudos-skeleton" key={item}>
                  <span className="skeleton-avatar" />
                  <div className="skeleton-lines">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              ))}
            </div>
          ) : kudosState.error ? (
            <div className="recognition-state" role="alert">
              <span className="recognition-state-icon error"><AlertCircle size={24}/></span>
              <h3>Unable to load the kudos feed</h3>
              <p>{kudosState.error}</p>
              <Button variant="secondary" onClick={retry} disabled={kudosState.loading}>
                <RefreshCw size={15}/> Try again
              </Button>
            </div>
          ) : kudos.length === 0 ? (
            <div className="recognition-state">
              <span className="recognition-state-icon"><Gift size={24}/></span>
              <h3>No kudos shared yet</h3>
              <p>Be the first to recognize a teammate for the difference they make.</p>
              <Button onClick={() => setOpen(true)}><Heart size={15}/> Give the first kudos</Button>
            </div>
          ) : (
            <div className="recognition-feed">
              {kudos.map((item) => <KudosCard key={item.id} item={item} />)}
            </div>
          )}
        </Panel>

        <aside className="recognition-aside">
          <Panel className="recognition-aside-panel">
            <div className="recognition-aside-icon"><Sparkles size={23}/></div>
            <h3>Good work deserves to be seen.</h3>
            <p>Specific, thoughtful appreciation helps people understand the difference they made.</p>
            <div className="recognition-prompt">
              <strong>Try a kudos prompt</strong>
              <p>“I appreciated how you...”</p>
              <button type="button" onClick={() => setOpen(true)}>Write a kudos <Send size={14}/></button>
            </div>
            <div className="recognition-aside-note">
              <Lightbulb size={16}/>
              <span>Timely recognition lands best. Share it while the moment is fresh.</span>
            </div>
          </Panel>

        </aside>
      </div>

      <GiveKudosModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
