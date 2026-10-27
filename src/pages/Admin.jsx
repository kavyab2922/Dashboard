import { useState } from 'react';
import { CalendarDays, ExternalLink, Link2, Megaphone, ShieldAlert, Users, Settings2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button, PageTitle, Panel, Tag } from '../components/common/UI';
import EditableCollectionPage from '../components/common/EditableCollectionPage';

const resources = [
  { id:'announcements', title:'Announcements', description:'Create, edit and remove company updates.', count:'Posts', icon:Megaphone, tint:'purple', route:'/announcements' },
  { id:'events', title:'Upcoming events', description:'Maintain the company calendar and activities.', count:'Events', icon:CalendarDays, tint:'mint', route:'/events' },
  { id:'quickLinks', title:'Quick links', description:'Update frequently used resource cards and destinations.', count:'Links', icon:Link2, tint:'blue', route:'/quick-links' },
  { id:'contacts', title:'Quick Connect directory', description:'HR contacts sourced from the employee directory (read-only).', count:'Contacts', icon:Users, tint:'gold', route:'/hr-contacts' },
];

export default function Admin() {
  const [active, setActive] = useState('overview');
  const navigate = useNavigate();
  if (active !== 'overview') return <><EditableCollectionPage type={active} embedded/><div className="back-to-feed"><Button variant="secondary" onClick={()=>setActive('overview')}>← Back to admin overview</Button></div></>;
  return <><PageTitle eyebrow="CONTENT MANAGEMENT" title="Admin" description="Manage workplace content that is stored in the company database."/><div className="admin-warning"><span><ShieldAlert size={22}/></span><div><strong>Changes affect everyone</strong><p>Edits here are saved to the shared database through the API and are visible to all employees. Follow your company communication guidelines.</p></div><Tag tone="amber">SHARED DATA</Tag></div><div className="admin-resource-grid">{resources.map((item)=><Panel className="admin-resource-card" key={item.id}><div className={`admin-resource-icon ${item.tint}`}><item.icon size={21}/></div><div className="admin-resource-content"><h3>{item.title}</h3><p>{item.description}</p><span>{item.count} · stored in database</span></div><Button variant="secondary" onClick={()=>setActive(item.id)}>Manage <ExternalLink size={14}/></Button></Panel>)}</div><div className="admin-next-steps"><Panel><span className="admin-next-icon"><Settings2 size={19}/></span><h3>Content guidelines</h3><p>Announcements, events and quick links are persisted through the Express API. Validate destination URLs and review privacy/accessibility before publishing.</p><button onClick={()=>navigate('/settings')}>Review settings <span>→</span></button></Panel><Panel><span className="admin-next-icon purple"><Users size={19}/></span><h3>HR-approved content</h3><p>Official policy answers, verified HR contact details and company links are managed by People Operations in the database.</p><button onClick={()=>navigate('/hr-contacts')}>View Quick Connect <span>→</span></button></Panel></div><p className="demo-inline-note">All content shown in the app is loaded from the backend API and the company database.</p></>;
}