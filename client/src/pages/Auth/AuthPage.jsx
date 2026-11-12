import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, Mail, Store, UserRound, Contrast } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authPageConfig } from './page.config.js';
import './AuthPage.css';

export default function AuthPage({ initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [visualTheme, setVisualTheme] = useState(() => localStorage.getItem('spyrix_theme') || 'mono');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { setMode(initialMode); setError(''); }, [initialMode]);
  useEffect(() => { document.documentElement.dataset.spyrixTheme = visualTheme; }, [visualTheme]);

  const toggleVisualTheme = () => {
    const cycle = ['mono', 'neon', 'burgundy'];
    const next = cycle[(cycle.indexOf(visualTheme) + 1) % cycle.length];
    setVisualTheme(next);
    localStorage.setItem('spyrix_theme', next);
    window.dispatchEvent(new CustomEvent('spyrix:theme-change', { detail: next }));
  };
  useEffect(() => {
    document.title = `${mode === 'register' ? 'Create Account' : 'Sign In'} | ${authPageConfig.documentTitle}`;
  }, [mode]);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'register') await register({ name, businessName, email, password });
      else await login(email, password);
      navigate('/app/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className={`auth-page auth-mode-${mode}`} data-theme={visualTheme}>
      <button type="button" className="auth-theme-toggle" onClick={toggleVisualTheme} aria-label={`Current theme ${visualTheme}. Switch theme`}><Contrast size={17}/><span>{visualTheme === 'mono' ? 'Black & White' : visualTheme === 'neon' ? 'Neon Yellow & Black' : 'Burgundy'}</span></button>
      <section className="auth-panel">
        <Link className="auth-back-link" to="/" aria-label="Return to SPYRIX INVOICE intro"><ArrowLeft size={16} /> SPYRIX INVOICE</Link>
        <img className="auth-logo" src="/assets/spyrix-logo.svg" alt="SPYRIX" />
        <div className="auth-brand-growth"><strong>{authPageConfig.brandTitle}</strong><span>{authPageConfig.brandTagline}</span></div>
        <div className="auth-kicker">YOUR BUSINESS. UNDER CONTROL.</div>
        <h1>{mode === 'register' ? 'Create your workspace' : 'Welcome back.'}</h1>
        <p className="auth-subtitle">{mode === 'register' ? 'Start managing your business with SPYRIX INVOICE.' : 'Sign in to manage invoices, customers and payments.'}</p>
        <form onSubmit={submit} className="auth-form">
          {mode === 'register' && <>
            <label>Your name</label>
            <div className="auth-input"><UserRound size={18} /><input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" required autoComplete="name" /></div>
            <label>Business name</label>
            <div className="auth-input"><Store size={18} /><input value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="Your business" required /></div>
          </>}
          <label>Email address</label>
          <div className="auth-input"><Mail size={18} /><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email" /></div>
          <label>Password</label>
          <div className="auth-input"><LockKeyhole size={18} /><input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" minLength={8} required autoComplete={mode === 'register' ? 'new-password' : 'current-password'} /><button type="button" className="password-toggle" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>
          {error && <div className="auth-error" role="alert">{error}</div>}
          <button className="auth-submit" disabled={busy}>{busy ? 'Please wait…' : mode === 'register' ? 'Create Account' : 'Sign In'} <ArrowRight size={18} /></button>
        </form>
        <p className="auth-email-only-note">Secure access with your email address and password.</p>
        <div className="auth-switch">{mode === 'register' ? 'Already have an account?' : 'New to SPYRIX?'} <button onClick={() => { setMode(mode === 'register' ? 'login' : 'register'); setError(''); }}>{mode === 'register' ? 'Sign in' : 'Create account'}</button></div>
        <p className="auth-footnote">Sign in or create an account to securely access your business workspace and saved records.</p>
      </section>
      <aside className="auth-art">
        <div className="auth-art-content"><span className="auth-badge">SPYRIX INVOICE</span><h2>Manage your business<br /><em>Smarter & Faster.</em></h2><p>Professional invoicing, clearer payments and better control — in one workspace.</p></div>
      </aside>
    </main>
  );
}
