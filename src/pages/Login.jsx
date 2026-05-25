import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, MOCK_USERS } from '../context/AuthContext';
import { Eye, EyeOff, Shield, Lock, User, AlertCircle, Zap, CheckCircle, ChevronRight } from 'lucide-react';

const KC_STEPS = [
  'Connecting to Keycloak realm…',
  'Validating credentials…',
  'Exchanging authorization token…',
  'Loading user profile…',
  'Setting up session…',
];

function FloatingOrb({ style }) {
  return <div className="absolute rounded-full pointer-events-none" style={{ filter: 'blur(80px)', ...style }} />;
}

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState('landing'); // landing | form | processing | success
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [kcStep, setKcStep] = useState(0);
  const [selectedDemo, setSelectedDemo] = useState(null);

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setStep('processing');
    setKcStep(0);

    // Animate through Keycloak steps
    for (let i = 0; i < KC_STEPS.length; i++) {
      await new Promise(r => setTimeout(r, 420));
      setKcStep(i + 1);
    }

    try {
      await login(username, password);
      setStep('success');
      await new Promise(r => setTimeout(r, 1000));
      navigate('/', { replace: true });
    } catch {
      setStep('form');
      setError('Invalid username or password. Please try again.');
    }
  };

  const fillDemo = (u) => {
    setSelectedDemo(u.id);
    setUsername(u.username);
    setPassword(u.password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #06050f 0%, #0c0a1e 50%, #080714 100%)' }}>

      {/* Background orbs */}
      <FloatingOrb style={{ width: 600, height: 600, background: 'rgba(99,102,241,0.12)', top: -200, left: -200 }} />
      <FloatingOrb style={{ width: 400, height: 400, background: 'rgba(168,85,247,0.1)', bottom: -100, right: -100 }} />
      <FloatingOrb style={{ width: 300, height: 300, background: 'rgba(236,72,153,0.07)', top: '40%', left: '40%' }} />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="relative z-10 w-full max-w-md px-4">

        {/* ── Landing / SSO Button ─────────────────────────── */}
        {step === 'landing' && (
          <div className="text-center animate-fade-in">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 8px 40px rgba(99,102,241,0.5)' }}>
                  {/* Orbit logo */}
                  <div className="relative w-10 h-10">
                    <div className="absolute inset-0 rounded-full animate-spin-slow"
                      style={{ border: '1.5px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%' }} />
                    <div className="absolute rounded-full"
                      style={{ inset: 4, border: '1.5px solid rgba(255,255,255,0.25)', borderBottomColor: 'rgba(255,255,255,0.8)', borderRadius: '50%', animation: 'spin-slow 4s linear infinite reverse' }} />
                    <div className="absolute rounded-full flex items-center justify-center"
                      style={{ inset: 8, background: 'white', boxShadow: '0 0 8px white' }}>
                      <div className="w-2 h-2 rounded-full" style={{ background: '#6366f1' }} />
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-400 border-2 border-[#06050f] flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                </div>
              </div>
            </div>

            <h1 className="text-3xl font-black text-white tracking-tight mb-1"
              style={{ background: 'linear-gradient(135deg, #a5b4fc, #c084fc, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              OfficeVerse
            </h1>
            <p className="text-white/40 text-sm mb-10">Your Digital Workplace Universe</p>

            {/* SSO Card */}
            <div className="glass-card p-8 text-left mb-4"
              style={{ border: '1px solid rgba(99,102,241,0.25)', boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
                  <Shield size={18} style={{ color: '#818cf8' }} />
                </div>
                <div>
                  <p className="text-white font-bold text-base">Single Sign-On</p>
                  <p className="text-white/40 text-xs">Secured by Keycloak IAM</p>
                </div>
              </div>

              <button onClick={() => setStep('form')}
                className="w-full py-3.5 rounded-2xl font-black text-white text-base flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 8px 32px rgba(99,102,241,0.45)' }}>
                {/* Keycloak logo SVG */}
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <circle cx="11" cy="11" r="10" fill="rgba(255,255,255,0.15)" />
                  <path d="M6 11 Q11 5 16 11 Q11 17 6 11Z" fill="white" opacity="0.9" />
                  <circle cx="11" cy="11" r="2.5" fill="white" />
                </svg>
                Sign in with Keycloak
                <ChevronRight size={18} />
              </button>

              <div className="flex items-center gap-2 mt-4 justify-center">
                <Lock size={11} className="text-white/20" />
                <p className="text-white/25 text-xs">256-bit encrypted · PKCE flow · realm: officeverse</p>
              </div>
            </div>

            {/* Demo hint */}
            <p className="text-white/20 text-xs">
              Demo environment · No real Keycloak server required
            </p>
          </div>
        )}

        {/* ── Login Form ───────────────────────────────────── */}
        {step === 'form' && (
          <div className="animate-fade-in">
            {/* Keycloak header */}
            <div className="glass-card mb-4 overflow-hidden"
              style={{ border: '1px solid rgba(99,102,241,0.2)' }}>
              <div className="px-5 py-3 flex items-center gap-3"
                style={{ background: 'linear-gradient(90deg, rgba(99,102,241,0.15), transparent)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
                  <circle cx="11" cy="11" r="10" fill="rgba(99,102,241,0.3)" />
                  <path d="M6 11 Q11 5 16 11 Q11 17 6 11Z" fill="#818cf8" opacity="0.9" />
                  <circle cx="11" cy="11" r="2.5" fill="#818cf8" />
                </svg>
                <div>
                  <p className="text-white/80 text-sm font-bold">Keycloak</p>
                  <p className="text-white/30 text-xs">realm: officeverse · client: officeverse-portal</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400/70 text-xs font-medium">Connected</span>
                </div>
              </div>

              <div className="p-6">
                <h2 className="text-white font-black text-xl mb-1">Sign in to OfficeVerse</h2>
                <p className="text-white/40 text-sm mb-6">Enter your SSO credentials to continue</p>

                {error && (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-4"
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
                    <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                    <p className="text-red-400 text-xs">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-white/50 text-xs font-bold uppercase tracking-wider block mb-2">
                      Username or Email
                    </label>
                    <div className="relative">
                      <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                      <input
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        placeholder="username or email@officeverse.com"
                        className="input-field pl-10"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-white/50 text-xs font-bold uppercase tracking-wider block mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                      <input
                        type={showPw ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••••"
                        className="input-field pl-10 pr-10"
                        required
                      />
                      <button type="button" onClick={() => setShowPw(p => !p)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                        {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <button type="submit"
                    className="w-full py-3.5 rounded-2xl font-black text-white text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] mt-2"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 8px 32px rgba(99,102,241,0.4)' }}>
                    <Shield size={15} /> Sign In Securely
                  </button>
                </form>

                <button onClick={() => setStep('landing')}
                  className="w-full mt-3 py-2 text-xs text-white/30 hover:text-white/55 transition-colors">
                  ← Back to SSO portal
                </button>
              </div>
            </div>

            {/* Demo users */}
            <div className="glass-card p-4" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-white/25 text-xs font-bold uppercase tracking-wider mb-3">
                Demo Accounts — click to autofill
              </p>
              <div className="space-y-2">
                {MOCK_USERS.map(u => (
                  <button key={u.id} onClick={() => fillDemo(u)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left"
                    style={selectedDemo === u.id
                      ? { background: `${u.color}18`, border: `1px solid ${u.color}35` }
                      : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }
                    }
                    onMouseEnter={e => { if (selectedDemo !== u.id) e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
                    onMouseLeave={e => { if (selectedDemo !== u.id) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                  >
                    <div className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={u.photo} alt={u.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/75 text-xs font-bold truncate">{u.name}</p>
                      <p className="text-white/30 text-[10px] truncate">{u.username} · {u.role}</p>
                    </div>
                    <div className="flex flex-wrap gap-1 flex-shrink-0">
                      {u.keycloakRoles.slice(0, 2).map(r => (
                        <span key={r} className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                          style={{ background: `${u.color}20`, color: u.color }}>
                          {r}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Processing / Keycloak Flow ───────────────────── */}
        {step === 'processing' && (
          <div className="text-center animate-fade-in">
            <div className="glass-card p-10"
              style={{ border: '1px solid rgba(99,102,241,0.25)', boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }}>
              {/* Spinning Keycloak logo */}
              <div className="flex justify-center mb-8">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 rounded-full animate-spin"
                    style={{ border: '2px solid rgba(99,102,241,0.15)', borderTopColor: '#6366f1' }} />
                  <div className="absolute inset-3 rounded-full animate-spin"
                    style={{ border: '2px solid rgba(139,92,246,0.15)', borderBottomColor: '#8b5cf6', animationDirection: 'reverse', animationDuration: '0.7s' }} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg width="28" height="28" viewBox="0 0 22 22" fill="none">
                      <circle cx="11" cy="11" r="10" fill="rgba(99,102,241,0.2)" />
                      <path d="M6 11 Q11 5 16 11 Q11 17 6 11Z" fill="#818cf8" />
                      <circle cx="11" cy="11" r="2.5" fill="#a5b4fc" />
                    </svg>
                  </div>
                </div>
              </div>

              <h3 className="text-white font-black text-lg mb-2">Authenticating…</h3>
              <p className="text-white/40 text-sm mb-8">Keycloak SSO · realm: officeverse</p>

              {/* Step indicators */}
              <div className="space-y-3 text-left">
                {KC_STEPS.map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: kcStep > i ? 'rgba(16,185,129,0.2)' : kcStep === i ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${kcStep > i ? 'rgba(16,185,129,0.4)' : kcStep === i ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`,
                        transition: 'all 0.3s ease',
                      }}>
                      {kcStep > i
                        ? <CheckCircle size={12} className="text-emerald-400" />
                        : kcStep === i
                          ? <div className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
                          : <div className="w-2 h-2 rounded-full bg-white/15" />
                      }
                    </div>
                    <span className="text-xs font-medium transition-colors duration-300"
                      style={{ color: kcStep > i ? '#34d399' : kcStep === i ? '#a5b4fc' : 'rgba(255,255,255,0.2)' }}>
                      {s}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Success ──────────────────────────────────────── */}
        {step === 'success' && (
          <div className="text-center animate-scale-in">
            <div className="glass-card p-10"
              style={{ border: '1px solid rgba(16,185,129,0.3)', boxShadow: '0 24px 60px rgba(0,0,0,0.5), 0 0 60px rgba(16,185,129,0.1)' }}>
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: 'rgba(16,185,129,0.15)', border: '2px solid rgba(16,185,129,0.4)', boxShadow: '0 0 40px rgba(16,185,129,0.3)' }}>
                <CheckCircle size={36} className="text-emerald-400" />
              </div>
              <h3 className="text-white font-black text-xl mb-2">Authentication Successful!</h3>
              <p className="text-white/40 text-sm">Redirecting to your workspace…</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
