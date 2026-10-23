import { useState } from 'react';
import { ArrowUpRight, BookOpen, CalendarDays, Gift, LifeBuoy, Link2, ExternalLink, Search, Settings2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EditableCollectionPage from '../components/common/EditableCollectionPage';
import { Button, Panel, Tag } from '../components/common/UI';
import { useApp } from '../context/AppContext';
import { safeOpen } from '../utils/format';

const iconMap = { CalendarDays, BookOpen, Gift, LifeBuoy, Link2 };
const palettes = ['mint','purple','blue','gold','rose','teal'];

export default function QuickLinksPage() {
  const { quickLinks, setToast } = useApp();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [manage, setManage] = useState(false);
  const navigate = useNavigate();
  const categories = ['All', ...new Set(quickLinks.map((item) => item.category))];
  const filtered = quickLinks.filter((item) => `${item.title} ${item.description} ${item.category}`.toLowerCase().includes(search.toLowerCase()) && (category === 'All' || item.category === category));
  if (manage) return <><EditableCollectionPage type="quickLinks" embedded/><div className="back-to-feed"><Button variant="secondary" onClick={() => setManage(false)}>← Back to Quick Links</Button></div></>;
  const openLink = (item) => { if (item.url?.startsWith('/')) navigate(item.url); else if (safeOpen(item.url)) {} else setToast('This is a placeholder destination. Add the approved internal URL to enable it.'); };
  return <><div className="quicklinks-hero"><div className="quicklinks-hero-bubbles"><span><Link2 size={24}/></span><i>↗</i><b>✦</b></div><div><Tag tone="mint">YOUR EVERYDAY TOOLKIT</Tag><h2>The right place, in one click.</h2><p>Company system destinations are placeholders until the approved URLs are provided.</p></div></div><div className="links-toolbar"><label className="inline-search"><Search size={16}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Find a resource..."/></label><div className="filter-chip-row">{categories.map((item) => <button key={item} className={`filter-chip ${category === item ? 'selected' : ''}`} onClick={() => setCategory(item)}>{item}</button>)}</div><Button variant="secondary" onClick={() => setManage(true)}><Settings2 size={15}/> Manage links</Button></div><div className="quicklinks-page-grid">{filtered.map((item, index) => { const Icon = iconMap[item.icon] || Link2; return <Panel className="quicklink-card" key={item.id}><div className="quicklink-card-top"><span className={`quicklink-big-icon quicklink-tone-${index % palettes.length}`}><Icon size={22}/></span>{item.placeholder && <Tag tone="amber">Placeholder</Tag>}{!item.placeholder && <ArrowUpRight size={17} className="quicklink-external"/>}</div><span className="quicklink-category">{item.category}</span><h3>{item.title}</h3><p>{item.description}</p><button className="quicklink-open" onClick={() => openLink(item)}>Open resource <ArrowUpRight size={15}/></button></Panel>;})}{filtered.length === 0 && <Panel className="quicklink-empty"><Search size={22}/><h3>No links found</h3><p>Try a different keyword or category.</p></Panel>}</div><p className="demo-inline-note">No internal destinations have been verified or connected. Replace every placeholder before production use.</p></>;
}