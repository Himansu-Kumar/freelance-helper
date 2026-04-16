import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
  User,
  Building2,
  CreditCard,
  Lock,
  Save,
  CheckCircle,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';

// ── tiny helpers ────────────────────────────────────────────────────────────

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'SGD', 'AED'];
const TIMEZONES = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver',
  'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Europe/Berlin',
  'Asia/Kolkata', 'Asia/Tokyo', 'Asia/Shanghai', 'Australia/Sydney',
];

function Toast({ message, type, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);

  const base =
    'fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 border-4 border-black text-sm font-black transition-all uppercase tracking-widest';
  const styles =
    type === 'success'
      ? `${base} bg-black text-white`
      : `${base} bg-white text-black`;

  return (
    <div className={styles}>
      {type === 'success' ? (
        <CheckCircle className="h-4 w-4 shrink-0" />
      ) : (
        <AlertCircle className="h-4 w-4 shrink-0" />
      )}
      {message}
    </div>
  );
}

function SectionCard({ icon: Icon, title, subtitle, children }) {
  return (
    <div className="bg-white border-4 border-black overflow-hidden">
      <div className="px-6 py-5 border-b-4 border-black flex items-center gap-3 bg-black text-white">
        <div className="h-9 w-9 border-2 border-white flex items-center justify-center">
          <Icon className="h-4 w-4" strokeWidth={2.5} />
        </div>
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest leading-tight">{title}</h2>
          {subtitle && <p className="text-[10px] uppercase opacity-70 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-black text-black uppercase tracking-widest">
        {label}
      </label>
      {children}
      {hint && <p className="text-[10px] text-black font-bold uppercase opacity-60 tracking-tighter">{hint}</p>}
    </div>
  );
}

const inputCls =
  'w-full px-4 py-3 border-2 border-black bg-white text-black placeholder-black/30 outline-none focus:bg-black focus:text-white transition-all font-bold uppercase text-sm';

const selectCls =
  'w-full px-4 py-3 border-2 border-black bg-white text-black outline-none focus:bg-black focus:text-white transition-all font-bold uppercase text-sm';

// ── main component ───────────────────────────────────────────────────────────

const Settings = () => {
  const { user, updateUser } = useAuth();

  // ── profile state
  const [profile, setProfile] = useState({
    name: '',
    email: '',
  });

  // ── business state
  const [business, setBusiness] = useState({
    businessName: '',
    address: '',
    taxId: '',
  });

  // ── preferences state
  const [prefs, setPrefs] = useState({
    currency: 'USD',
    timezone: 'UTC',
  });

  // ── payment state
  const [payment, setPayment] = useState({
    bankInfo: '',
    upi: '',
    paypalLink: '',
  });

  // ── password state
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // ── ui state
  const [saving, setSaving] = useState(null);
  const [toast, setToast] = useState(null);

  // ── populate from user on mount / user change
  useEffect(() => {
    if (!user) return;
    setProfile({ name: user.name || '', email: user.email || '' });
    setBusiness({
      businessName: user.businessName || '',
      address: user.address || '',
      taxId: user.taxId || '',
    });
    setPrefs({
      currency: user.preferences?.currency || 'USD',
      timezone: user.preferences?.timezone || 'UTC',
    });
    setPayment({
      bankInfo: user.paymentDetails?.bankInfo || '',
      upi: user.paymentDetails?.upi || '',
      paypalLink: user.paymentDetails?.paypalLink || '',
    });
  }, [user]);

  const showToast = (message, type = 'success') => setToast({ message, type });

  // ── generic profile/business/payment save — now refreshes AuthContext
  const saveSection = async (sectionKey, payload) => {
    setSaving(sectionKey);
    try {
      await api.put('/auth/me', payload);
      // Re-fetch the user so AuthContext (and the sidebar avatar) stays in sync
      const userRes = await api.get('/auth/me');
      updateUser(userRes.data.data);
      showToast('Changes saved successfully');
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to save changes', 'error');
    } finally {
      setSaving(null);
    }
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    saveSection('profile', { name: profile.name, email: profile.email });
  };

  const handleBusinessSave = (e) => {
    e.preventDefault();
    saveSection('business', {
      businessName: business.businessName,
      address: business.address,
      taxId: business.taxId,
      preferences: { currency: prefs.currency, timezone: prefs.timezone },
    });
  };

  const handlePaymentSave = (e) => {
    e.preventDefault();
    saveSection('payment', { paymentDetails: payment });
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();

    if (passwords.newPassword !== passwords.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    if (passwords.newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    setSaving('password');
    try {
      await api.put('/auth/updatepassword', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('Password updated successfully');
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to update password', 'error');
    } finally {
      setSaving(null);
    }
  };

  const SaveBtn = ({ section, label = 'Save Changes' }) => (
    <button
      type="submit"
      disabled={saving === section}
      className="flex items-center gap-2 px-6 py-3 bg-black text-white text-xs font-black uppercase tracking-widest border-2 border-black hover:bg-white hover:text-black disabled:opacity-30 transition-all focus:outline-none"
    >
      <Save className="h-4 w-4" strokeWidth={2.5} />
      {saving === section ? 'RECORDING…' : label}
    </button>
  );

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDone={() => setToast(null)}
        />
      )}

      <div className="max-w-2xl mx-auto space-y-10 pb-12 overflow-x-hidden">
        {/* ── header ── */}
        <div className="border-b-4 border-black pb-6">
          <h1 className="text-4xl font-black text-black uppercase tracking-tighter">Settings</h1>
          <p className="mt-2 text-xs font-black text-black uppercase tracking-widest">
            Configuration Panel
          </p>
        </div>

        {/* ── breadcrumb nav ── */}
        <nav className="flex items-center gap-2 text-[10px] text-black font-black uppercase tracking-widest opacity-40">
          <span>Root</span>
          <ChevronRight className="h-3 w-3" strokeWidth={3} />
          <span>System</span>
          <ChevronRight className="h-3 w-3" strokeWidth={3} />
          <span className="opacity-100 underline">Configuration</span>
        </nav>

        {/* ── avatar + name banner ── */}
        <div className="flex items-center gap-6 bg-black p-8 text-white border-4 border-black">
          <div className="h-20 w-20 border-4 border-white flex items-center justify-center text-4xl font-black shrink-0">
            {user?.name?.charAt(0).toUpperCase() || '?'}
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-black uppercase tracking-tighter truncate">{user?.name}</p>
            <p className="text-xs font-bold uppercase opacity-60 tracking-widest truncate mt-1">{user?.email}</p>
          </div>
        </div>

        {/* ══ SECTION 1 — Profile ══════════════════════════════════════════ */}
        <SectionCard
          icon={User}
          title="Personal Info"
          subtitle="Your name and sign-in email address"
        >
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name">
                <input
                  type="text"
                  className={inputCls}
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Jane Doe"
                  required
                />
              </Field>
              <Field label="Email Address">
                <input
                  type="email"
                  className={inputCls}
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  placeholder="jane@example.com"
                  required
                />
              </Field>
            </div>
            <div className="flex justify-end pt-2">
              <SaveBtn section="profile" />
            </div>
          </form>
        </SectionCard>

        {/* ══ SECTION 2 — Business & Preferences ══════════════════════════ */}
        <SectionCard
          icon={Building2}
          title="Business Details"
          subtitle="Shown on invoices and reports"
        >
          <form onSubmit={handleBusinessSave} className="space-y-4">
            <Field label="Business / Freelancer Name">
              <input
                type="text"
                className={inputCls}
                value={business.businessName}
                onChange={(e) => setBusiness({ ...business, businessName: e.target.value })}
                placeholder="Jane Doe Design Studio"
              />
            </Field>

            <Field label="Business Address">
              <textarea
                rows={2}
                className={inputCls}
                value={business.address}
                onChange={(e) => setBusiness({ ...business, address: e.target.value })}
                placeholder="123 Creator St, City, Country"
              />
            </Field>

            <Field
              label="Tax ID / GST / VAT Number"
              hint="Appears on invoices if filled in"
            >
              <input
                type="text"
                className={inputCls}
                value={business.taxId}
                onChange={(e) => setBusiness({ ...business, taxId: e.target.value })}
                placeholder="GSTIN / EIN / VAT ID"
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <Field label="Default Currency">
                <select
                  className={selectCls}
                  value={prefs.currency}
                  onChange={(e) => setPrefs({ ...prefs, currency: e.target.value })}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Timezone">
                <select
                  className={selectCls}
                  value={prefs.timezone}
                  onChange={(e) => setPrefs({ ...prefs, timezone: e.target.value })}
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="flex justify-end pt-2">
              <SaveBtn section="business" />
            </div>
          </form>
        </SectionCard>

        {/* ══ SECTION 3 — Payment Details ══════════════════════════════════ */}
        <SectionCard
          icon={CreditCard}
          title="Payment Details"
          subtitle="How clients can pay you — printed on invoices"
        >
          <form onSubmit={handlePaymentSave} className="space-y-4">
            <Field
              label="Bank / Wire Transfer Info"
              hint="Account name, account number, IFSC / SWIFT / routing number"
            >
              <textarea
                rows={3}
                className={inputCls}
                value={payment.bankInfo}
                onChange={(e) => setPayment({ ...payment, bankInfo: e.target.value })}
                placeholder={`Account Name: Jane Doe\nAccount No: 000123456789\nIFSC: HDFC0001234`}
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="UPI ID" hint="For Indian clients">
                <input
                  type="text"
                  className={inputCls}
                  value={payment.upi}
                  onChange={(e) => setPayment({ ...payment, upi: e.target.value })}
                  placeholder="jane@upi"
                />
              </Field>
              <Field label="PayPal / Payment Link">
                <input
                  type="text"
                  className={inputCls}
                  value={payment.paypalLink}
                  onChange={(e) => setPayment({ ...payment, paypalLink: e.target.value })}
                  placeholder="https://paypal.me/janedoe"
                />
              </Field>
            </div>

            <div className="flex justify-end pt-2">
              <SaveBtn section="payment" />
            </div>
          </form>
        </SectionCard>

        {/* ══ SECTION 4 — Password ═════════════════════════════════════════ */}
        <SectionCard
          icon={Lock}
          title="Change Password"
          subtitle="Choose a strong password of at least 6 characters"
        >
          <form onSubmit={handlePasswordSave} className="space-y-4">
            <Field label="Current Password">
              <input
                type="password"
                className={inputCls}
                value={passwords.currentPassword}
                onChange={(e) =>
                  setPasswords({ ...passwords, currentPassword: e.target.value })
                }
                placeholder="••••••••"
                required
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="New Password">
                <input
                  type="password"
                  className={inputCls}
                  value={passwords.newPassword}
                  onChange={(e) =>
                    setPasswords({ ...passwords, newPassword: e.target.value })
                  }
                  placeholder="••••••••"
                  required
                />
              </Field>
              <Field label="Confirm New Password">
                <input
                  type="password"
                  className={inputCls}
                  value={passwords.confirmPassword}
                  onChange={(e) =>
                    setPasswords({ ...passwords, confirmPassword: e.target.value })
                  }
                  placeholder="••••••••"
                  required
                />
              </Field>
            </div>

            {passwords.confirmPassword &&
              passwords.newPassword !== passwords.confirmPassword && (
                <p className="text-[10px] font-black text-black uppercase tracking-widest flex items-center gap-2 bg-white border-2 border-black p-2 mt-2">
                  <AlertCircle className="h-4 w-4" strokeWidth={3} /> Passwords Mismatch
                </p>
              )}

            <div className="flex justify-end pt-2">
              <SaveBtn section="password" label="Update Password" />
            </div>
          </form>
        </SectionCard>
      </div>
    </>
  );
};

export default Settings;