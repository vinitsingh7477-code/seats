import { useState, type FormEvent } from 'react';
import { ArrowRight, LockKeyhole, RotateCw } from 'lucide-react';
import { useAuth } from './authContext';

type AuthMode = 'sign-in' | 'sign-up';

export default function AuthPanel() {
  const auth = useAuth();
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    auth.clearFeedback();
    if (mode === 'sign-up') await auth.signUp({ displayName, email, password, passwordConfirmation });
    else await auth.signIn(email, password);
  }

  return <section className="auth-panel" aria-labelledby="auth-title">
    <div className="auth-panel-heading"><span className="auth-lock"><LockKeyhole size={19} /></span><div><span className="section-kicker">ACCOUNT ACCESS</span><h3 id="auth-title">Your travel, in one place</h3></div></div>
    <p className="auth-lede">Sign in to review standby request records tied to your account. Search history stays in this browser; signing in does not create a request or reserve a seat.</p>

    {!auth.configured ? <div className="auth-config-status" role="status"><strong>Account connection not configured</strong><span>Demo browsing is ready. Add the authorized Supabase URL and publishable key to <code>.env.local</code> to enable account access.</span></div>
      : auth.loadingSession ? <div className="auth-config-status" role="status"><span className="loading-mark" /> Checking your secure account session…</div>
        : auth.session ? <div className="auth-controls">
          <div className="signed-in-card"><span className="signed-in-mark" aria-hidden="true" /><div><strong>Signed in</strong><span>{auth.session.user.email ?? 'Account email unavailable'}</span></div></div>
          <p>Only request records permitted by your account’s database policies are shown. No trip is booked through this page.</p>
          <button className="auth-submit secondary-action" type="button" disabled={auth.submitting} onClick={() => void auth.signOut()}>
            {auth.submitting ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
          : <div className="auth-controls">
            <div className="auth-mode" role="group" aria-label="Account action">
              <button type="button" aria-pressed={mode === 'sign-in'} onClick={() => { setMode('sign-in'); auth.clearFeedback(); }}>Sign in</button>
              <button type="button" aria-pressed={mode === 'sign-up'} onClick={() => { setMode('sign-up'); auth.clearFeedback(); }}>Create account</button>
            </div>
            <form className="auth-form" onSubmit={(event) => void submit(event)}>
              {mode === 'sign-up' && <label>Display name<input autoComplete="name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} required maxLength={100} /></label>}
              <label>Email address<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required maxLength={254} /></label>
              <label>Password<input type="password" autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'} value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} maxLength={128} /></label>
              {mode === 'sign-up' && <label>Confirm password<input type="password" autoComplete="new-password" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} required maxLength={128} /></label>}
              <button className="auth-submit" type="submit" disabled={auth.submitting}>
                {auth.submitting ? 'Please wait…' : mode === 'sign-up' ? 'Create your account' : 'Sign in'} <ArrowRight size={16} />
              </button>
            </form>
            <p className="auth-privacy-note">Your credentials are sent directly to the configured Supabase Auth project. This app never asks for airline account credentials.</p>
          </div>}

    {auth.error && <div className="auth-message auth-error" role="alert"><p>{auth.error}</p>{auth.configured && !auth.session && !auth.loadingSession && <button type="button" onClick={() => void auth.refreshSession()}><RotateCw size={15} /> Check connection</button>}</div>}
    {auth.notice && <p className="auth-message auth-notice" role="status">{auth.notice}</p>}
  </section>;
}
