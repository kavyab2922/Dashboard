import { useState } from 'react';
import { Activity, ArrowRight } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button, FormField } from '../components/common/UI';

export default function Login() {
  const { token, login, loading } = useApp();
  const [email, setEmail] = useState('kavya.b01@simplify3x.com');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && token) return <Navigate to="/" replace />;

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email.trim());
    } catch (err) {
      setError(err.message || 'Could not sign in. Check that the API is running.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <span className="brand-mark"><Activity size={22} strokeWidth={2.6} /></span>
          <div>
            <strong>HROrbit</strong>
            <small>Employee workspace</small>
          </div>
        </div>
        <h1>Sign in to your hub</h1>
        <p>Use your work email. The API issues a session token and loads live workplace data.</p>
        <form className="form-stack" onSubmit={submit}>
          <FormField label="Work email">
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              autoComplete="email"
            />
          </FormField>
          {error && <p className="login-error">{error}</p>}
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Continue'} <ArrowRight size={16} />
          </Button>
        </form>
      </div>
    </div>
  );
}
