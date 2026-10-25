import { useState } from 'react';
import { Activity, ArrowRight, Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { useApp } from '../context/AppContext';

const initialForm = { name: '', email: '', password: '', confirmPassword: '' };

export default function Login({ mode = 'login' }) {
  const navigate = useNavigate();
  const { startSession } = useApp();
  const [form, setForm] = useState(initialForm);
  const [isRegistering, setIsRegistering] = useState(mode === 'register');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const switchMode = (registering) => {
    setIsRegistering(registering);
    setForm(initialForm);
    setError('');
  };

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (isRegistering && form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      const response = isRegistering
        ? await authApi.register({ name: form.name.trim(), email: form.email.trim(), password: form.password })
        : await authApi.login({ email: form.email.trim(), password: form.password });
      localStorage.setItem('hrobit-auth-token', response.token);
      startSession(response.user);
      navigate('/', { replace: true });
    } catch (requestError) {
      setError(requestError.message || 'Unable to continue. Please try again.');
    } finally {
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
            <h2>{isRegistering ? 'Create your account' : 'Welcome back'}</h2>
            <p>{isRegistering ? 'Join your employee experience hub.' : 'Sign in to continue to your employee hub.'}</p>
          </div>

          <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
            <button type="button" className={!isRegistering ? 'active' : ''} onClick={() => switchMode(false)}>Sign in</button>
            <button type="button" className={isRegistering ? 'active' : ''} onClick={() => switchMode(true)}>Register</button>
          </div>

          <form onSubmit={submit} className="auth-form">
            {isRegistering && <label className="auth-field"><span>Full name</span><div className="auth-input-wrap"><UserRound size={17} /><input name="name" value={form.name} onChange={updateField} placeholder="Your full name" autoComplete="name" required /></div></label>}
            <label className="auth-field"><span>Work email</span><div className="auth-input-wrap"><Mail size={17} /><input type="email" name="email" value={form.email} onChange={updateField} placeholder="you@company.com" autoComplete="email" required /></div></label>
            <label className="auth-field"><span>Password</span><div className="auth-input-wrap"><LockKeyhole size={17} /><input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={updateField} placeholder="Enter your password" autoComplete={isRegistering ? 'new-password' : 'current-password'} minLength={6} required /><button type="button" className="auth-password-toggle" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
            {isRegistering && <label className="auth-field"><span>Confirm password</span><div className="auth-input-wrap"><LockKeyhole size={17} /><input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={form.confirmPassword} onChange={updateField} placeholder="Re-enter your password" autoComplete="new-password" minLength={6} required /><button type="button" className="auth-password-toggle" aria-label={showConfirmPassword ? 'Hide confirmation password' : 'Show confirmation password'} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>}
            {!isRegistering && <div className="auth-form-meta"><label><input type="checkbox" /> <span>Remember me</span></label><button type="button" className="auth-link" onClick={() => setError('Please contact HR to reset your password.')}>Forgot password?</button></div>}
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button className="auth-submit" type="submit" disabled={busy}>{busy ? 'Please wait…' : isRegistering ? 'Create account' : 'Sign in'} {!busy && <ArrowRight size={17} />}</button>
          </form>

          <p className="auth-switch">{isRegistering ? 'Already have an account?' : 'New to HROrbit?'} <button type="button" className="auth-link" onClick={() => switchMode(!isRegistering)}>{isRegistering ? 'Sign in' : 'Create an account'}</button></p>
          <small className="auth-legal">By continuing, you agree to the HROrbit terms and privacy policy.</small>
        </div>
        <Link className="auth-back-link" to="/">← Back to employee hub</Link>
      </section>
    </main>
  );
}
