import { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  Check,
  ChevronRight,
  Moon,
  RotateCcw,
  ShieldCheck,
  Sun,
  UserRound,
  WandSparkles,
} from 'lucide-react';
import { Avatar, PageTitle, Panel, Button, Select, Tag } from '../components/common/UI';
import { useApp } from '../context/AppContext';
import RoleSwitch from '../components/common/RoleSwitch';

const SETTINGS_KEY = 'hrobit-settings-preferences-v1';
const DEFAULT_PREFERENCES = {
  emailUpdates: true,
  eventReminders: true,
  weeklyDigest: false,
  birthdayOverlay: true,
  compactCards: false,
};

const sections = [
  { id: 'notifications', label: 'Notifications', description: 'Choose what reaches you', icon: Bell },
  { id: 'appearance', label: 'Appearance', description: 'Make the space yours', icon: WandSparkles },
  { id: 'workspace', label: 'Workspace access', description: 'Review your current mode', icon: ShieldCheck },
];

function loadPreferences() {
  try {
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

function Toggle({ label, description, checked, onChange }) {
  return (
    <div className="settings-preference-row">
      <div className="settings-preference-copy"><strong>{label}</strong><p>{description}</p></div>
      <button type="button" role="switch" aria-checked={checked} aria-label={`${label}: ${checked ? 'On' : 'Off'}`} className={`settings-toggle ${checked ? 'is-on' : ''}`} onClick={() => onChange(!checked)}>
        <span />
      </button>
    </div>
  );
}

function SectionHeader({ icon: Icon, eyebrow, title, description, tone = '' }) {
  return (
    <div className="settings-section-header">
      <span className={`settings-section-icon ${tone}`}><Icon size={19} /></span>
      <div><span className="settings-section-eyebrow">{eyebrow}</span><h2>{title}</h2><p>{description}</p></div>
    </div>
  );
}

function ThemeCard({ active, icon: Icon, title, description, onSelect, dark = false }) {
  return (
    <button type="button" className={`settings-theme-card ${active ? 'is-selected' : ''}`} aria-pressed={active} onClick={onSelect}>
      <span className={`settings-theme-preview ${dark ? 'is-dark' : ''}`}><i /><i /><i /><b /></span>
      <span className="settings-theme-copy"><strong>{title}</strong><small>{description}</small></span>
      <span className="settings-theme-check" aria-hidden="true">{active && <Check size={14} />}</span>
    </button>
  );
}

export default function Settings() {
  const { theme, setTheme, setToast, role, user, setRole } = useApp();
  const [activeSection, setActiveSection] = useState('notifications');
  const [preferences, setPreferences] = useState(loadPreferences);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(preferences)); } catch { /* keep preferences in memory */ }
  }, [preferences]);

  const updatePreference = (key, value) => {
    setPreferences((current) => ({ ...current, [key]: value }));
    setToast('Preference saved.');
  };

  const reset = () => {
    if (resetting || !window.confirm('Reset your HROrbit preferences to their defaults?')) return;
    setResetting(true);
    setPreferences(DEFAULT_PREFERENCES);
    try { localStorage.removeItem('hrobit-demo-state-v1'); localStorage.removeItem(SETTINGS_KEY); } catch { /* storage is optional */ }
    setTheme('light');
    const roleChanged = setRole('Employee');
    setToast(roleChanged ? 'Preferences reset to defaults.' : 'Preferences reset, but your workspace mode could not be changed.');
    window.setTimeout(() => setResetting(false), 250);
  };

  const currentSection = useMemo(() => sections.find((section) => section.id === activeSection) || sections[0], [activeSection]);
  const displayName = user?.name || 'Employee';

  return (
    <div className="settings-page">
      <PageTitle eyebrow="PERSONALIZE YOUR EXPERIENCE" title="Settings" description="Manage your preferences and account." />

      <div className="settings-mobile-select-wrap">
        <label htmlFor="settings-section-select">Settings section</label>
        <Select id="settings-section-select" ariaLabel="Settings section" value={activeSection} onChange={setActiveSection} options={sections.map((section) => ({ value: section.id, label: section.label }))} />
      </div>

      <div className="settings-layout">
        <aside className="settings-sidebar" aria-label="Settings sections">
          <div className="settings-sidebar-profile"><Avatar name={displayName} initials={user?.initials} src={user?.avatar} color={user?.color || 'blue'} size="sm" /><div><strong>{displayName}</strong><span>{user?.email || 'Personal workspace'}</span></div></div>
          <nav className="settings-nav">
            <span className="settings-nav-label">YOUR SETTINGS</span>
            {sections.map((section) => { const Icon = section.icon; return <button type="button" key={section.id} className={`settings-nav-item ${activeSection === section.id ? 'is-active' : ''}`} aria-current={activeSection === section.id ? 'page' : undefined} onClick={() => setActiveSection(section.id)}><span className="settings-nav-icon"><Icon size={16} /></span><span><strong>{section.label}</strong><small>{section.description}</small></span><ChevronRight size={15} /></button>; })}
          </nav>
          <div className="settings-sidebar-footer"></div>
        </aside>

        <main className="settings-content" aria-live="polite">
          <div className="settings-content-heading"><div><span className="settings-section-eyebrow">{currentSection.label.toUpperCase()}</span><h2>{currentSection.description}</h2></div><Tag tone="mint"><Check size={12} /> Auto-saved</Tag></div>

          {activeSection === 'notifications' && (
            <Panel className="settings-card">
              <SectionHeader icon={Bell} eyebrow="NOTIFICATION PREFERENCES" title="Stay in the loop" description="Choose the updates and reminders you want to see in your portal." />
              <div className="settings-preferences">
                <Toggle label="Announcements and HR updates" description="Important updates from your people team and workplace." checked={preferences.emailUpdates} onChange={(value) => updatePreference('emailUpdates', value)} />
                <Toggle label="Upcoming event reminders" description="A reminder when events are coming up in your employee feed." checked={preferences.eventReminders} onChange={(value) => updatePreference('eventReminders', value)} />
                <Toggle label="Weekly employee digest" description="A short summary of highlights, activities, and new resources." checked={preferences.weeklyDigest} onChange={(value) => updatePreference('weeklyDigest', value)} />
                <Toggle label="Birthday celebration overlay" description="Show the celebratory visual when a colleague has a birthday." checked={preferences.birthdayOverlay} onChange={(value) => updatePreference('birthdayOverlay', value)} />
              </div>
            </Panel>
          )}

          {activeSection === 'appearance' && (
            <Panel className="settings-card">
              <SectionHeader icon={WandSparkles} eyebrow="DISPLAY PREFERENCES" title="Make it comfortable" description="Choose a theme and layout density that works for you." tone="purple" />
              <div className="settings-subsection"><h3>Theme</h3><p>Changes apply across the dashboard immediately.</p><div className="settings-theme-grid"><ThemeCard title="Light theme" description="Bright and calm" icon={Sun} active={theme === 'light'} onSelect={() => { setTheme('light'); setToast('Light theme applied.'); }} /><ThemeCard title="Dark theme" description="Easy on the eyes" icon={Moon} active={theme === 'dark'} dark onSelect={() => { setTheme('dark'); setToast('Dark theme applied.'); }} /></div></div>
              <div className="settings-preferences settings-preferences-compact"><Toggle label="Compact dashboard cards" description="Use a denser presentation for dashboard content where supported." checked={preferences.compactCards} onChange={(value) => updatePreference('compactCards', value)} /></div>
            </Panel>
          )}

          {activeSection === 'workspace' && (
            <Panel className="settings-card">
              <SectionHeader icon={ShieldCheck} eyebrow="ACCOUNT & SECURITY" title="Workspace access" description="Review the access mode associated with your signed-in account." />
              <div className="settings-account-summary"><span className="settings-account-icon"><UserRound size={18} /></span><div><strong>{displayName}</strong><p>{user?.role || user?.designation || 'Employee account'}{user?.team ? ` · ${user.team}` : ''}</p></div><Tag tone="blue">{role}</Tag></div>
              <div className="settings-security-note"><ShieldCheck size={17} /><div><strong>Access follows your account permissions</strong><p>HROrbit does not expose passwords or security tokens in Settings.</p></div></div>
              <RoleSwitch onSwitched={() => setActiveSection('workspace')} />
            </Panel>
          )}

          <section className="settings-reset-card"><div><span className="settings-reset-icon"><RotateCcw size={16} /></span><div><h3>Reset preferences</h3><p>Restore themes, notification choices, and layout preferences to their defaults.</p></div></div><Button variant="secondary" size="sm" disabled={resetting} onClick={reset}>{resetting ? 'Resetting…' : 'Reset to defaults'}</Button></section>
        </main>
      </div>
    </div>
  );
}
