import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const MOCK_USERS = [
  {
    id: 'emp001',
    username: 'arjun.sharma',
    email: 'arjun.sharma@officeverse.com',
    password: 'Arjun@123',
    name: 'Arjun Sharma',
    role: 'Senior Software Engineer',
    department: 'Engineering',
    avatar: 'AS',
    photo: 'https://randomuser.me/api/portraits/men/32.jpg',
    color: '#6366f1',
    points: 1250,
    birthday: '1993-04-10',
    keycloakRoles: ['employee', 'developer'],
  },
  {
    id: 'emp002',
    username: 'priya.menon',
    email: 'priya.menon@officeverse.com',
    password: 'Priya@123',
    name: 'Priya Menon',
    role: 'Engineering Manager',
    department: 'Engineering',
    avatar: 'PM',
    photo: 'https://randomuser.me/api/portraits/women/44.jpg',
    color: '#8b5cf6',
    points: 2100,
    birthday: '1989-04-11',
    keycloakRoles: ['employee', 'manager', 'hr-viewer'],
  },
  {
    id: 'emp007',
    username: 'meera.nair',
    email: 'meera.nair@officeverse.com',
    password: 'Meera@123',
    name: 'Meera Nair',
    role: 'HR Business Partner',
    department: 'Human Resources',
    avatar: 'MN',
    photo: 'https://randomuser.me/api/portraits/women/33.jpg',
    color: '#f97316',
    points: 1540,
    birthday: '1991-04-23',
    keycloakRoles: ['employee', 'hr-admin'],
  },
];

const SESSION_KEY = 'officeverse_session';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session on reload
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) setUser(JSON.parse(saved));
    } catch {}
    setLoading(false);
  }, []);

  const login = async (usernameOrEmail, password) => {
    // Simulate Keycloak token exchange delay
    await new Promise(r => setTimeout(r, 1200));

    const found = MOCK_USERS.find(u =>
      (u.username === usernameOrEmail || u.email === usernameOrEmail) &&
      u.password === password
    );

    if (!found) throw new Error('Invalid credentials');

    const session = {
      ...found,
      password: undefined,
      accessToken: `eyJhbGciOiJSUzI1NiJ9.mock.${Date.now()}`,
      tokenExpiry: Date.now() + 8 * 60 * 60 * 1000, // 8 hours
      loginTime: new Date().toISOString(),
      realm: 'officeverse',
      clientId: 'officeverse-portal',
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
    return session;
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  const isAuthenticated = !!user && user.tokenExpiry > Date.now();

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export { MOCK_USERS };
