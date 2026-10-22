export const employees = [
  { id: 'e1', name: 'B Kavya', role: 'Software Engineer', team: 'Design', email: 'kavya.demo@example.com', location: 'Bengaluru', birthday: '2003-10-22', joined: '2022-10-22', initials: 'AS', color: 'coral' },
  { id: 'e2', name: 'Priya Menon', role: 'Engineering Manager', team: 'Engineering', email: 'priya.demo@example.com', location: 'Bengaluru', birthday: '1996-04-14', joined: '2021-04-12', initials: 'PM', color: 'purple' },
  { id: 'e3', name: 'Meera Nair', role: 'People Partner', team: 'People & Culture', email: 'meera.demo@example.com', location: 'Hyderabad', birthday: '1997-11-06', joined: '2023-07-03', initials: 'MN', color: 'mint' },
  { id: 'e4', name: 'Dev Patel', role: 'Software Engineer', team: 'Engineering', email: 'dev.demo@example.com', location: 'Pune', birthday: '1999-01-18', joined: '2024-01-18', initials: 'DP', color: 'blue' },
  { id: 'e5', name: 'Ananya Rao', role: 'Learning Partner', team: 'People & Culture', email: 'ananya.demo@example.com', location: 'Bengaluru', birthday: '1995-06-29', joined: '2020-06-29', initials: 'AR', color: 'gold' },
];

export const currentEmployee = employees[0];

export const birthdays = [
  { ...employees[0], dateLabel: 'Today' },
  { ...employees[2], dateLabel: 'Nov 6' },
  { ...employees[1], dateLabel: 'Apr 14' },
];

export const hrContacts = [
  { id: 'hr1', name: 'Meera Nair', team: 'People & Culture', focus: 'Benefits, leave and employee support', email: 'meera.demo@example.com', extension: 'Demo contact', location: 'Bengaluru', initials: 'MN', color: 'mint' },
  { id: 'hr2', name: 'Ananya Rao', team: 'Learning & Development', focus: 'Learning paths, training and development', email: 'ananya.demo@example.com', extension: 'Demo contact', location: 'Bengaluru', initials: 'AR', color: 'gold' },
  { id: 'hr3', name: 'Priya Menon', team: 'People Operations', focus: 'Onboarding and employee records', email: 'priya.demo@example.com', extension: 'Demo contact', location: 'Bengaluru', initials: 'PM', color: 'purple' },
];