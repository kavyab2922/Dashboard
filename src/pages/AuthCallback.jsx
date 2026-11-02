import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { useApp } from '../context/AppContext';

// Microsoft SSO lands here with the session token in the URL fragment.
export default function AuthCallback() {
  const navigate = useNavigate();
  const { startSession } = useApp();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const token = new URLSearchParams(window.location.hash.slice(1)).get('token');
    // Drop the token from the address bar and browser history.
    window.history.replaceState(null, '', window.location.pathname);
    if (!token) {
      navigate('/login?error=sso_failed', { replace: true });
      return;
    }

    localStorage.setItem('hrobit-auth-token', token);
    authApi.profile()
      .then((response) => {
        startSession(response.user);
        navigate('/', { replace: true });
      })
      .catch(() => {
        localStorage.removeItem('hrobit-auth-token');
        navigate('/login?error=session', { replace: true });
      });
  }, [navigate, startSession]);

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="auth-card"><p>Signing you in…</p></div>
      </section>
    </main>
  );
}
