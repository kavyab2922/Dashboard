import { useState } from 'react';
import { Activity, ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../services/api';
import { useApp } from '../context/AppContext';

const COMPANY_DOMAIN = 'simplify3x.com';

const errorMessages = {
  network: 'Available only on the company network.',
  not_authorized: 'Your account is not set up for HROrbit. Please contact HR.',
  session: 'We could not start your session. Please sign in again.',
};

export default function Login() {
  const navigate = useNavigate();
  const { startSession } = useApp();
  const [searchParams] = useSearchParams();
  const errorCode = searchParams.get('error');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(errorCode ? (errorMessages[errorCode] || errorMessages.session) : '');

  const signIn = async (event) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail.endsWith(`@${COMPANY_DOMAIN}`)) {
      setError(`Use your @${COMPANY_DOMAIN} company email.`);
      return;
    }

    setBusy(true);
    setError('');
    try {
      const { token } = await authApi.login(normalizedEmail, password);
      localStorage.setItem('hrobit-auth-token', token);
      const response = await authApi.profile();
      startSession(response.user);
      navigate('/', { replace: true });
    } catch (err) {
      localStorage.removeItem('hrobit-auth-token');
      setError(err.message || errorMessages.session);
      setBusy(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-visual" aria-label="HROrbit employee experience">
        <div className="auth-brand"><span className="auth-brand-mark"><Activity size={22} /></span><strong>HROrbit</strong></div>
        <div className="auth-visual-copy">
          <span className="auth-eyebrow">EMPLOYEE EXPERIENCE PLATFORM</span>
          <h1>Everything your people need, in one orbit.</h1>
          <p>Stay connected to your workplace, discover opportunities and celebrate every win.</p>
          <div className="auth-stat-row"><span><strong>24/7</strong><small>People support</small></span><span><strong>1 hub</strong><small>For every team</small></span></div>
        </div>
        <span className="auth-orbit auth-orbit-one" /><span className="auth-orbit auth-orbit-two" />
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <div className="auth-card-heading">
            <span className="auth-mobile-mark"><Activity size={18} /></span>
            <span className="auth-eyebrow">WELCOME TO HROrbit</span>
            <h2>Welcome back</h2>
            <p>Sign in with your Simplify3x company email and password to continue to your employee hub.</p>
          </div>

          <form className="auth-form" onSubmit={signIn}>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <label className="auth-field">
              Company email
              <span className="auth-input-wrap">
                <Mail size={17} />
                <input
                  type="email"
                  autoComplete="username"
                  placeholder={`name@${COMPANY_DOMAIN}`}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoFocus
                />
              </span>
            </label>
            <label className="auth-field">
              Password
              <span className="auth-input-wrap">
                <Lock size={17} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Your company password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <button
                  className="auth-password-toggle"
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </span>
            </label>
            <button className="auth-submit" type="submit" disabled={busy}>
              {busy ? 'Signing in…' : 'Sign in'} {!busy && <ArrowRight size={17} />}
            </button>
            <p className="auth-switch"><ShieldCheck size={15} /> Available only on the company network.</p>
          </form>

          <small className="auth-legal">By continuing, you agree to the HROrbit terms and privacy policy.</small>
        </div>
        <Link className="auth-back-link" to="/">← Back to employee hub</Link>
      </section>
    </main>
  );
}
