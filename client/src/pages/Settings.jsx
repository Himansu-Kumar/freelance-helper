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
    'fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-sm font-medium transition-all';
  const styles =
    type === 'success'
      ? `${base} bg-emerald-600 text-white`
      : `${base} bg-red-600 text-white`;

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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3 bg-gray-50/60">
        <div className="h-9 w-9 rounded-lg bg-indigo-50 flex items-center justify-center">
          <Icon className="h-4 w-4 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900 leading-tight">{title}</h2>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

const inputCls =
  'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all';

const selectCls =
  'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all';

// ── main component ───────────────────────────────────────────────────────────

const Settings = () => {
  const { user, login: reLogin } = useAuth();

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
  const [saving, setSaving] = useState(null); // which section is saving
  const [toast, setToast] = useState(null);   // { message, type }

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

  // ── generic profile/business/payment save
  const saveSection = async (sectionKey, payload) => {
    setSaving(sectionKey);
    try {
      const res = await api.put('/auth/me', payload);
      // Update AuthContext user without full re-login
      // We re-fetch /auth/me via the existing getMe pattern
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
      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
    >
      <Save className="h-3.5 w-3.5" />
      {saving === section ? 'Saving…' : label}
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

      <div className="max-w-2xl mx-auto space-y-6 pb-12">
        {/* ── header ── */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your account, business details, and preferences.
          </p>
        </div>

        {/* ── breadcrumb nav ── */}
        <nav className="flex items-center gap-1 text-xs text-gray-400 font-medium">
          <span className="text-gray-600">Account</span>
          <ChevronRight className="h-3 w-3" />
          <span>Settings</span>
        </nav>

        {/* ── avatar + name banner ── */}
        <div className="flex items-center gap-4 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl px-6 py-5 text-white shadow-lg shadow-indigo-100">
          <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-2xl font-bold shrink-0">
            {user?.name?.charAt(0).toUpperCase() || '?'}
          </div>
          <div className="min-w-0">
            <p className="text-lg font-semibold truncate">{user?.name}</p>
            <p className="text-indigo-200 text-sm truncate">{user?.email}</p>
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

            {/* inline mismatch warning */}
            {passwords.confirmPassword &&
              passwords.newPassword !== passwords.confirmPassword && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> Passwords do not match
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