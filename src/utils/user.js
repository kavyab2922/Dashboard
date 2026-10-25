function computeInitials(name) {
  return (name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function normalizeUser(raw) {
  if (!raw) return null;
  const name = raw.name || [raw.first_name, raw.last_name].filter(Boolean).join(' ').trim() || 'Employee';
  return {
    ...raw,
    name,
    initials: raw.initials || computeInitials(name),
    team: raw.team ?? raw.department ?? null,
    role: raw.designation ?? raw.role ?? null,
    email: raw.email ?? raw.official_email ?? raw.personal_email ?? null,
    joined: raw.joined ?? raw.join_date ?? null,
    employmentType: raw.employmentType ?? raw.employee_type ?? null,
    organization: raw.organization ?? raw.organization_name ?? null,
    avatar: raw.avatar ?? raw.profile_picture_url ?? null,
    interests: Array.isArray(raw.interests) ? raw.interests : [],
    color: raw.color || 'blue',
  };
}
