import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

type View = 'signin' | 'signup' | 'welcome' | 'dashboard';

type User = {
  id: number;
  fullName: string;
  email: string;
  role: string;
};

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  businessType: string;
  gstNumber: string;
  city: string;
  state: string;
  message: string;
};

const initialForm: FormState = {
  fullName: '',
  email: '',
  phone: '',
  companyName: '',
  businessType: '',
  gstNumber: '',
  city: '',
  state: '',
  message: ''
};

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getStoredAuth = (): { token: string; user: User } | null => {
  try {
    const token = localStorage.getItem('token');
    const raw = localStorage.getItem('user');
    if (!token || !raw) return null;
    return { token, user: JSON.parse(raw) };
  } catch {
    return null;
  }
};

const saveAuth = (token: string, user: User) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// ─── Root App ───────────────────────────────────────────────────────────────

function App() {
  const [view, setView] = useState<View>('signin');
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    const stored = getStoredAuth();
    if (stored) {
      setToken(stored.token);
      setUser(stored.user);
      setView('welcome');
    }
  }, []);

  const handleAuthSuccess = (newToken: string, newUser: User) => {
    saveAuth(newToken, newUser);
    setToken(newToken);
    setUser(newUser);
    setView('welcome');
  };

  const handleSignOut = () => {
    clearAuth();
    setToken('');
    setUser(null);
    setView('signin');
  };

  if (view === 'signin') {
    return <SigninForm onSuccess={handleAuthSuccess} onSwitchToSignup={() => setView('signup')} />;
  }
  if (view === 'signup') {
    return <SignupForm onSuccess={handleAuthSuccess} onSwitchToSignin={() => setView('signin')} />;
  }
  if (view === 'welcome' && user) {
    return <WelcomePage user={user} onGoToDashboard={() => setView('dashboard')} onSignOut={handleSignOut} />;
  }
  if (view === 'dashboard' && user) {
    return <Dashboard token={token} user={user} onSignOut={handleSignOut} />;
  }
  return null;
}

// ─── Sign In ─────────────────────────────────────────────────────────────────

function SigninForm({ onSuccess, onSwitchToSignup }: {
  onSuccess: (token: string, user: User) => void;
  onSwitchToSignup: () => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${apiUrl}/api/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.message || 'Sign in failed');
      onSuccess(payload.token, { ...payload.user, fullName: payload.user.fullName });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h1 className="text-2xl font-semibold text-gray-900">Sign in to your account</h1>
      <p className="mt-2 text-sm text-gray-500">Welcome back. Enter your credentials to continue.</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <AuthInput label="Email address" type="email" value={email} onChange={setEmail} required />
        <AuthInput label="Password" type="password" value={password} onChange={setPassword} required />
        {error && <ErrorBox text={error} />}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-gray-500">
        Don't have an account?{' '}
        <button onClick={onSwitchToSignup} className="font-medium text-red-600 hover:text-red-500">
          Create one
        </button>
      </p>
    </AuthLayout>
  );
}

// ─── Sign Up ─────────────────────────────────────────────────────────────────

function SignupForm({ onSuccess, onSwitchToSignin }: {
  onSuccess: (token: string, user: User) => void;
  onSwitchToSignin: () => void;
}) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${apiUrl}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName, email, password, role: 'user' })
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.message || 'Sign up failed');
      onSuccess(payload.token, payload.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h1 className="text-2xl font-semibold text-gray-900">Create your account</h1>
      <p className="mt-2 text-sm text-gray-500">Get started — it only takes a moment.</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <AuthInput label="Full name" value={fullName} onChange={setFullName} required />
        <AuthInput label="Email address" type="email" value={email} onChange={setEmail} required />
        <AuthInput label="Password" type="password" value={password} onChange={setPassword} required />
        {error && <ErrorBox text={error} />}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <button onClick={onSwitchToSignin} className="font-medium text-red-600 hover:text-red-500">
          Sign in
        </button>
      </p>
    </AuthLayout>
  );
}

// ─── Welcome ─────────────────────────────────────────────────────────────────

function WelcomePage({ user, onGoToDashboard, onSignOut }: {
  user: User | undefined;
  onGoToDashboard: () => void;
  onSignOut: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200 text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 text-2xl font-bold mb-5">
          {user?.fullName?.charAt(0)?.toUpperCase() ?? 'A'}
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">Welcome back, {user?.fullName ?? 'User'}!</h1>
        <p className="mt-3 text-sm text-gray-500">Your tax application dashboard is ready. Submit or track your business applications.</p>
        <button
          onClick={onGoToDashboard}
          className="mt-7 w-full rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-500 transition"
        >
          Go to Dashboard →
        </button>
        <button onClick={onSignOut} className="mt-4 text-sm text-gray-400 hover:text-gray-600 transition">
          Sign out
        </button>
      </div>
    </div>
  );
}

// ─── Dashboard (existing form, unchanged UI) ─────────────────────────────────

function Dashboard({ token, user, onSignOut }: { token: string; user: User; onSignOut: () => void }) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submitForm = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setNotice(null);

    try {
      const response = await fetch(`${apiUrl}/api/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || 'Submission failed');
      setForm(initialForm);
      setNotice({ type: 'success', text: 'Application submitted successfully. Our team will review it shortly.' });
    } catch (error) {
      setNotice({ type: 'error', text: error instanceof Error ? error.message : 'Unable to submit application' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-ink text-white">
      <div className="flex items-center justify-between px-5 py-3 md:px-8 border-b border-white/10">
        <span className="text-sm text-zinc-400">Signed in as <span className="text-white">{user.fullName}</span></span>
        <button onClick={onSignOut} className="text-sm text-zinc-400 hover:text-white transition">Sign out</button>
      </div>
      <section className="mx-auto grid min-h-[calc(100vh-49px)] w-full max-w-7xl gap-10 px-5 py-8 md:grid-cols-[0.85fr_1.15fr] md:px-8 lg:items-center">
        <div className="space-y-7">
          <div className="inline-flex rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-100">
            Client onboarding application
          </div>
          <div className="space-y-5">
            <h1 className="text-4xl font-semibold tracking-normal md:text-6xl">Apply with confidence.</h1>
            <p className="max-w-xl text-base leading-7 text-zinc-300 md:text-lg">
              Share your business details through a secure, focused application form. The review team receives your submission instantly.
            </p>
          </div>
          <div className="grid gap-4 text-sm text-zinc-300 sm:grid-cols-3">
            <div className="border-l border-red-500 pl-4">Fast review flow</div>
            <div className="border-l border-red-500 pl-4">Clean data capture</div>
            <div className="border-l border-red-500 pl-4">No file upload needed</div>
          </div>
        </div>

        <form onSubmit={submitForm} className="rounded-lg border border-white/10 bg-zinc-950 p-5 shadow-2xl shadow-red-950/30 md:p-7">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">Application Form</h2>
            <p className="mt-2 text-sm text-zinc-400">Fields marked with * are required.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Full name *" value={form.fullName} onChange={(value) => updateField('fullName', value)} required />
            <Input label="Email *" type="email" value={form.email} onChange={(value) => updateField('email', value)} required />
            <Input label="Phone *" value={form.phone} onChange={(value) => updateField('phone', value)} required />
            <Input label="Company name" value={form.companyName} onChange={(value) => updateField('companyName', value)} />
            <Input label="Business type" value={form.businessType} onChange={(value) => updateField('businessType', value)} />
            <Input label="GST number" value={form.gstNumber} onChange={(value) => updateField('gstNumber', value)} />
            <Input label="City" value={form.city} onChange={(value) => updateField('city', value)} />
            <Input label="State" value={form.state} onChange={(value) => updateField('state', value)} />
          </div>

          <label className="mt-4 block text-sm font-medium text-zinc-200">
            Message
            <textarea
              className="mt-2 min-h-28 w-full rounded-md border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-red-500"
              value={form.message}
              onChange={(event) => updateField('message', event.target.value)}
            />
          </label>

          {notice && (
            <div className={`mt-5 rounded-md border px-4 py-3 text-sm ${notice.type === 'success' ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100' : 'border-red-500/40 bg-red-500/10 text-red-100'}`}>
              {notice.text}
            </div>
          )}

          <button
            className="mt-6 w-full rounded-md bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
            type="submit"
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </section>
    </main>
  );
}

// ─── Shared components ────────────────────────────────────────────────────────

function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
        {children}
      </div>
    </div>
  );
}

function AuthInput({ label, value, onChange, type = 'text', required = false }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-medium text-gray-700">
      {label}
      <input
        className="mt-1.5 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </label>
  );
}

function Input({ label, value, onChange, type = 'text', required = false }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-medium text-zinc-200">
      {label}
      <input
        className="mt-2 w-full rounded-md border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-red-500"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
      />
    </label>
  );
}

function ErrorBox({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {text}
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
