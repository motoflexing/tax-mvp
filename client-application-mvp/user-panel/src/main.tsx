import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

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

function App() {
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || 'Submission failed');
      }

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
      <section className="mx-auto grid min-h-screen w-full max-w-7xl gap-10 px-5 py-8 md:grid-cols-[0.85fr_1.15fr] md:px-8 lg:items-center">
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

createRoot(document.getElementById('root')!).render(<App />);
