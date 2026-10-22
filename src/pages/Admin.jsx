import { useState } from 'react';
import { CalendarDays, ExternalLink, Link2, Megaphone, ShieldAlert, Users, Settings2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button, PageTitle, Panel, Tag } from '../components/common/UI';
import EditableCollectionPage from '../components/common/EditableCollectionPage';

const resources = [
  { id:'announcements', title:'Announcements', description:'Create, edit and remove demo company updates.', count:'Posts', icon:Megaphone, tint:'purple', route:'/announcements' },
  { id:'events', title:'Upcoming events', description:'Maintain the sample company calendar and activities.', count:'Events', icon:CalendarDays, tint:'mint', route:'/events' },
  { id:'quickLinks', title:'Quick links', description:'Update frequently used resource cards and destinations.', count:'Links', icon:Link2, tint:'blue', route:'/quick-links' },
  { id:'contacts', title:'Quick Connect directory', description:'Edit fictional contact records used in the UI.', count:'Contacts', icon:Users, tint:'gold', route:'/hr-contacts' },
];

export default function Admin() {
  const [active, setActive] = useState('overview');
  const navigate = useNavigate();
  if (active !== 'overview') return <><EditableCollectionPage type={active} embedded/><div className="back-to-feed"><Button variant="secondary" onClick={()=>setActive('overview')}>← Back to admin overview</Button></div></>;
  return <><PageTitle eyebrow="UI MANAGEMENT PREVIEW" title="Demo admin" description="Manage prototype content without a backend or production permissions."/><div className="admin-warning"><span><ShieldAlert size={22}/></span><div><strong>Prototype controls only</strong><p>Any visitor can change these demo lists in the browser. This role switch is not authorization and must not be used as a security boundary.</p></div><Tag tone="amber">NOT SECURE</Tag></div><div className="admin-resource-grid">{resources.map((item)=><Panel className="admin-resource-card" key={item.id}><div className={`admin-resource-icon ${item.tint}`}><item.icon size={21}/></div><div className="admin-resource-content"><h3>{item.title}</h3><p>{item.description}</p><span>{item.count} · local demo data</span></div><Button variant="secondary" onClick={()=>setActive(item.id)}>Manage <ExternalLink size={14}/></Button></Panel>)}</div><div className="admin-next-steps"><Panel><span className="admin-next-icon"><Settings2 size={19}/></span><h3>Before production</h3><p>Connect approved Express APIs, enforce permissions on the server, replace mock data, validate destination URLs and review privacy/accessibility.</p><button onClick={()=>navigate('/settings')}>Review demo settings <span>→</span></button></Panel><Panel><span className="admin-next-icon purple"><Users size={19}/></span><h3>HR-approved content</h3><p>Official policy answers, verified HR contact details, confirmed events and company links are not supplied in this prototype.</p><button onClick={()=>navigate('/hr-contacts')}>View Quick Connect <span>→</span></button></Panel></div><p className="demo-inline-note">No backend, database or production API integration is included in Phase 1.</p></>;
}