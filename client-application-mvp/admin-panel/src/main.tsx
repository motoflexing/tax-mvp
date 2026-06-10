import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

type View = 'signin' | 'welcome' | 'dashboard';

type AdminUser = {
  id: number;
  fullName: string;
  email: string;
  role: string;
};

type Application = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  companyName: string | null;
  businessType: string | null;
  gstNumber: string | null;
  city: string | null;
  state: string | null;
  message: string | null;
  status: string;
  createdAt: string;
};

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getStoredAdminAuth = (): { token: string; user: AdminUser } | null => {
  try {
    const token = localStorage.getItem('adminToken');
    const raw = localStorage.getItem('adminUser');
    if (!token || !raw) return null;
    const user: AdminUser = JSON.parse(raw);
    if (user.role !== 'admin') return null;
    return { token, user };
  } catch {
    return null;
  }
};

const saveAdminAuth = (token: string, user: AdminUser) => {
  localStorage.setItem('adminToken', token);
  localStorage.setItem('adminUser', JSON.stringify(user));
};

const clearAdminAuth = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
};

// ─── Root App ────────────────────────────────────────────────────────────────

function App() {
  const [view, setView] = useState<View>('signin');
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    const stored = getStoredAdminAuth();
    if (stored) {
      setToken(stored.token);
      setAdminUser(stored.user);
      setView('welcome');
    }
  }, []);

  const handleSignIn = (newToken: string, user: AdminUser) => {
    saveAdminAuth(newToken, user);
    setToken(newToken);
    setAdminUser(user);
    setView('welcome');
  };

  const handleSignOut = () => {
    clearAdminAuth();
    setToken('');
    setAdminUser(null);
    setView('signin');
  };

  if (view === 'signin') {
    return <AdminSigninForm onSuccess={handleSignIn} />;
  }
  if (view === 'welcome' && adminUser) {
    return <AdminWelcomePage user={adminUser} onGoToDashboard={() => setView('dashboard')} onSignOut={handleSignOut} />;
  }
  if (view === 'dashboard' && adminUser) {
    return <AdminDashboard token={token} adminUser={adminUser} onSignOut={handleSignOut} />;
  }
  return null;
}

// ─── Admin Sign In ────────────────────────────────────────────────────────────

function AdminSigninForm({ onSuccess }: {
  onSuccess: (token: string, user: AdminUser) => void;
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
      if (payload.user?.role !== 'admin') {
        throw new Error('Not authorized as admin');
      }
      onSuccess(payload.token, payload.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
        <div className="mb-1 inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">Admin access</div>
        <h1 className="mt-3 text-2xl font-semibold text-gray-900">Sign in to Admin Panel</h1>
        <p className="mt-2 text-sm text-gray-500">Only authorised admin accounts can access this panel.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <AdminInput label="Email address" type="email" value={email} onChange={setEmail} required />
          <AdminInput label="Password" type="password" value={password} onChange={setPassword} required />
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Admin Welcome ────────────────────────────────────────────────────────────

function AdminWelcomePage({ user, onGoToDashboard, onSignOut }: {
  user: AdminUser;
  onGoToDashboard: () => void;
  onSignOut: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200 text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 text-2xl font-bold mb-5">
          {user.fullName.charAt(0).toUpperCase()}
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">Welcome back, {user.fullName}</h1>
        <p className="mt-3 text-sm text-gray-500">You have access to the admin dashboard. View and manage all submitted applications.</p>
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

// ─── Admin Dashboard (existing UI, unchanged) ────────────────────────────────

function AdminDashboard({ token, adminUser, onSignOut }: {
  token: string;
  adminUser: AdminUser;
  onSignOut: () => void;
}) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [businessType, setBusinessType] = useState('all');
  const [status, setStatus] = useState('all');
  const [selected, setSelected] = useState<Application | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const authHeaders = { Authorization: `Bearer ${token}` };

  const fetchApplications = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${apiUrl}/api/applications`, { headers: authHeaders });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || 'Unable to fetch applications');
      setApplications(payload.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();
    return applications.filter((app) => {
      const matchesSearch = !query || [app.fullName, app.email, app.phone, app.companyName || '']
        .join(' ')
        .toLowerCase()
        .includes(query);
      const matchesBusiness = businessType === 'all' || app.businessType === businessType;
      const matchesStatus = status === 'all' || app.status === status;
      return matchesSearch && matchesBusiness && matchesStatus;
    });
  }, [applications, search, businessType, status]);

  const businessTypes = Array.from(new Set(applications.map((app) => app.businessType).filter(Boolean))) as string[];
  const statuses = Array.from(new Set(applications.map((app) => app.status).filter(Boolean)));
  const today = new Date().toDateString();
  const stats = [
    { label: 'Total Applications', value: applications.length },
    { label: 'New Applications', value: applications.filter((app) => app.status === 'new').length },
    { label: 'Business Types', value: businessTypes.length },
    { label: "Today's Submissions", value: applications.filter((app) => new Date(app.createdAt).toDateString() === today).length }
  ];

  const deleteApplication = async (id: number) => {
    const confirmed = window.confirm('Delete this application?');
    if (!confirmed) return;
    try {
      const response = await fetch(`${apiUrl}/api/applications/${id}`, { method: 'DELETE', headers: authHeaders });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || 'Unable to delete application');
      setApplications((current) => current.filter((app) => app.id !== id));
      setSelected(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete application');
    }
  };

  return (
    <main className="min-h-screen bg-ink text-white">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-white/10 bg-black px-6 py-7 lg:block">
        <div className="text-xl font-semibold">Applications</div>
        <nav className="mt-10 space-y-2 text-sm text-zinc-300">
          <div className="rounded-md bg-red-600 px-4 py-3 text-white">Dashboard</div>
          <div className="px-4 py-3">Submissions</div>
          <div className="px-4 py-3">Reports</div>
        </nav>
        <div className="absolute bottom-6 left-6 right-6">
          <div className="text-xs text-zinc-500 truncate">{adminUser.email}</div>
          <button onClick={onSignOut} className="mt-2 text-sm text-zinc-400 hover:text-white transition">Sign out</button>
        </div>
      </aside>

      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/95 px-5 py-4 lg:hidden">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">Applications</span>
          <div className="flex items-center gap-3">
            <button onClick={onSignOut} className="text-sm text-zinc-400">Sign out</button>
            <button className="rounded-md border border-white/10 px-3 py-2 text-sm" onClick={() => setMenuOpen((v) => !v)}>Menu</button>
          </div>
        </div>
        {menuOpen && <div className="mt-4 rounded-md bg-red-600 px-4 py-3 text-sm">Dashboard</div>}
      </header>

      <section className="px-5 py-6 lg:ml-64 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-red-200">Admin Dashboard</p>
            <h1 className="mt-1 text-3xl font-semibold">Submitted Applications</h1>
          </div>
          <button onClick={fetchApplications} className="rounded-md bg-red-600 px-5 py-3 text-sm font-semibold hover:bg-red-500" disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-lg border border-white/10 bg-zinc-950 p-5">
              <p className="text-sm text-zinc-400">{stat.label}</p>
              <p className="mt-3 text-3xl font-semibold">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-3 rounded-lg border border-white/10 bg-zinc-950 p-4 md:grid-cols-[1fr_220px_180px]">
          <input
            className="rounded-md border border-white/10 bg-black px-4 py-3 outline-none focus:border-red-500"
            placeholder="Search name, email, phone, company"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select className="rounded-md border border-white/10 bg-black px-4 py-3 outline-none" value={businessType} onChange={(event) => setBusinessType(event.target.value)}>
            <option value="all">All business types</option>
            {businessTypes.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
          <select className="rounded-md border border-white/10 bg-black px-4 py-3 outline-none" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="all">All statuses</option>
            {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>

        {error && <div className="mt-5 rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-100">{error}</div>}

        <ApplicationsList
          applications={filtered}
          loading={loading}
          onView={setSelected}
          onDelete={deleteApplication}
        />
      </section>

      {selected && (
        <DetailsModal application={selected} onClose={() => setSelected(null)} onDelete={() => deleteApplication(selected.id)} />
      )}
    </main>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function AdminInput({ label, value, onChange, type = 'text', required = false }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
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

function ApplicationsList({ applications, loading, onView, onDelete }: {
  applications: Application[];
  loading: boolean;
  onView: (application: Application) => void;
  onDelete: (id: number) => void;
}) {
  if (loading) {
    return <div className="mt-8 rounded-lg border border-white/10 bg-zinc-950 p-8 text-center text-zinc-300">Loading applications...</div>;
  }
  if (applications.length === 0) {
    return <div className="mt-8 rounded-lg border border-white/10 bg-zinc-950 p-10 text-center text-zinc-300">No applications found.</div>;
  }

  return (
    <>
      <div className="mt-6 hidden overflow-hidden rounded-lg border border-white/10 bg-zinc-950 lg:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-black text-zinc-400">
            <tr>
              <th className="px-4 py-4">Applicant</th>
              <th className="px-4 py-4">Company</th>
              <th className="px-4 py-4">Business Type</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4">Submitted</th>
              <th className="px-4 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id} className="border-t border-white/10">
                <td className="px-4 py-4">
                  <div className="font-medium">{app.fullName}</div>
                  <div className="text-zinc-400">{app.email} · {app.phone}</div>
                </td>
                <td className="px-4 py-4">{app.companyName || '-'}</td>
                <td className="px-4 py-4">{app.businessType || '-'}</td>
                <td className="px-4 py-4"><Badge text={app.status} /></td>
                <td className="px-4 py-4">{formatDate(app.createdAt)}</td>
                <td className="px-4 py-4">
                  <button className="mr-2 rounded-md border border-white/10 px-3 py-2" onClick={() => onView(app)}>View</button>
                  <button className="rounded-md bg-red-600 px-3 py-2" onClick={() => onDelete(app.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid gap-4 lg:hidden">
        {applications.map((app) => (
          <div key={app.id} className="rounded-lg border border-white/10 bg-zinc-950 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold">{app.fullName}</h3>
                <p className="mt-1 text-sm text-zinc-400">{app.email}</p>
              </div>
              <Badge text={app.status} />
            </div>
            <div className="mt-4 space-y-2 text-sm text-zinc-300">
              <p>{app.phone}</p>
              <p>{app.companyName || 'No company'} · {app.businessType || 'No type'}</p>
              <p>{formatDate(app.createdAt)}</p>
            </div>
            <div className="mt-5 flex gap-3">
              <button className="flex-1 rounded-md border border-white/10 px-3 py-2" onClick={() => onView(app)}>View</button>
              <button className="flex-1 rounded-md bg-red-600 px-3 py-2" onClick={() => onDelete(app.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function DetailsModal({ application, onClose, onDelete }: {
  application: Application;
  onClose: () => void;
  onDelete: () => void;
}) {
  const rows = [
    ['Full name', application.fullName],
    ['Email', application.email],
    ['Phone', application.phone],
    ['Company', application.companyName || '-'],
    ['Business type', application.businessType || '-'],
    ['GST number', application.gstNumber || '-'],
    ['City', application.city || '-'],
    ['State', application.state || '-'],
    ['Status', application.status],
    ['Submitted', formatDate(application.createdAt)],
    ['Message', application.message || '-']
  ];

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/75 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-lg border border-white/10 bg-zinc-950 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Application Details</h2>
            <p className="mt-1 text-sm text-zinc-400">#{application.id}</p>
          </div>
          <button className="rounded-md border border-white/10 px-3 py-2" onClick={onClose}>Close</button>
        </div>
        <div className="mt-6 grid gap-3">
          {rows.map(([label, value]) => (
            <div key={label} className="grid gap-1 rounded-md bg-black p-4 sm:grid-cols-[150px_1fr]">
              <span className="text-sm text-zinc-500">{label}</span>
              <span className="break-words text-sm text-zinc-100">{value}</span>
            </div>
          ))}
        </div>
        <button className="mt-6 w-full rounded-md bg-red-600 px-4 py-3 font-semibold" onClick={onDelete}>Delete Application</button>
      </div>
    </div>
  );
}

function Badge({ text }: { text: string }) {
  return <span className="inline-flex rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-100">{text}</span>;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}

createRoot(document.getElementById('root')!).render(<App />);
