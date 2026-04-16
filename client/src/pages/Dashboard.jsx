import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
  DollarSign,
  Briefcase,
  FileText,
  Users,
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';


const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const statusColors = {
  Draft:   'border-black text-black',
  Sent:    'bg-black text-white px-2',
  Paid:    'border-2 border-black font-black text-black px-2',
  Overdue: 'bg-white text-black border border-dashed border-black px-2',
};

const projectStatusColors = {
  Active:    'border-black font-bold text-black px-2',
  Completed: 'bg-black text-white px-2',
  'On Hold': 'border border-black border-dashed text-black px-2',
  Cancelled: 'line-through text-black px-2',
};


function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="bg-white border-2 border-black p-5 flex items-start gap-4">
      <div className="h-11 w-11 border-2 border-black flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5 text-black" strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-black font-black uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-black text-black mt-0.5 tracking-tighter">{value}</p>
        {sub && <p className="text-[10px] text-black uppercase mt-1 opacity-60 font-bold">{sub}</p>}
      </div>
    </div>
  );
}

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState({
    projects: [],
    invoices: [],
    clients: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [pRes, iRes, cRes] = await Promise.all([
          api.get('/projects'),
          api.get('/invoices'),
          api.get('/clients'),
        ]);
        setData({
          projects: pRes.data.data,
          invoices: iRes.data.data,
          clients: cRes.data.data,
        });
      } catch (err) {
        console.error('Dashboard fetch error', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const { projects, invoices, clients } = data;

  // derived stats
  const totalRevenue = invoices
    .filter((i) => i.status === 'Paid')
    .reduce((s, i) => s + i.totalAmount, 0);

  const outstanding = invoices
    .filter((i) => i.status === 'Sent' || i.status === 'Overdue')
    .reduce((s, i) => s + i.totalAmount, 0);

  const activeProjects = projects.filter((p) => p.status === 'Active').length;
  const overdueInvoices = invoices.filter((i) => i.status === 'Overdue');

  // recent items (latest 5)
  const recentInvoices = [...invoices].slice(0, 5);
  const recentProjects = [...projects].slice(0, 5);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-10 group-inview">
      {/* ── header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b-4 border-black pb-6">
        <div>
          <h1 className="text-4xl font-black text-black uppercase tracking-tighter leading-none">
            {greeting()}, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-sm text-black font-bold uppercase mt-2 tracking-widest">
            Business Overview
          </p>
        </div>
        <div className="text-right">
           <p className="text-xs font-black text-black uppercase tracking-widest">
            {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
          </p>
          <p className="text-lg font-black text-black">
            {new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}
          </p>
        </div>
      </div>

      {/* ── overdue alert ── */}
      {!loading && overdueInvoices.length > 0 && (
        <div className="flex items-start gap-4 border-2 border-black p-4 bg-black text-white">
          <AlertCircle className="h-6 w-6 text-white shrink-0" strokeWidth={2.5} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black uppercase tracking-widest">
              {overdueInvoices.length} OVERDUE NOTICE
            </p>
            <p className="text-lg font-black mt-1">
              Outstanding: {fmt(overdueInvoices.reduce((s, i) => s + i.totalAmount, 0))}
            </p>
          </div>
          <Link
            to="/invoices"
            className="text-xs font-black uppercase bg-white text-black px-4 py-2 hover:bg-black hover:text-white border border-white transition-all"
          >
            Settle Now
          </Link>
        </div>
      )}

      {/* ── stat cards ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white border-2 border-black p-5 h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={DollarSign}
            label="Gross Income"
            value={fmt(totalRevenue)}
            sub={`${invoices.filter((i) => i.status === 'Paid').length} SETTLED`}
          />
          <StatCard
            icon={TrendingUp}
            label="Accounts Receivable"
            value={fmt(outstanding)}
            sub={`${invoices.filter((i) => i.status === 'Sent' || i.status === 'Overdue').length} PENDING`}
          />
          <StatCard
            icon={Briefcase}
            label="Active Files"
            value={activeProjects}
            sub={`${projects.length} TOTAL IN LOG`}
          />
          <StatCard
            icon={Users}
            label="Client List"
            value={clients.length}
            sub={`${projects.filter((p) => p.status === 'Completed').length} ARCHIVED`}
          />
        </div>
      )}

      {/* ── two-column section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <div className="bg-white border-2 border-black">
          <div className="px-5 py-4 border-b-2 border-black flex justify-between items-center bg-black text-white">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" strokeWidth={2} />
              <h2 className="text-xs font-black uppercase tracking-widest">Recent Invoices</h2>
            </div>
            <Link
              to="/invoices"
              className="text-[10px] font-black uppercase border border-white px-2 py-0.5 hover:bg-white hover:text-black transition-colors"
            >
              Full Ledger
            </Link>
          </div>

          {loading ? (
            <div className="p-5 space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 border border-black" />
              ))}
            </div>
          ) : recentInvoices.length === 0 ? (
            <div className="p-8 text-center bg-white">
              <FileText className="h-10 w-10 text-black opacity-20 mx-auto" strokeWidth={1} />
              <p className="text-xs font-black uppercase tracking-widest mt-4">No data recorded</p>
            </div>
          ) : (
            <ul className="divide-y divide-black">
              {recentInvoices.map((inv) => (
                <li key={inv._id} className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-black hover:text-white transition-colors group">
                  <div className="min-w-0">
                    <p className="text-sm font-black truncate uppercase">
                      {inv.invoiceNumber}
                    </p>
                    <p className="text-[10px] font-bold opacity-60 truncate uppercase">
                      {inv.client?.name || '—'} · DUE {new Date(inv.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className={`text-[10px] py-0.5 font-black uppercase border ${statusColors[inv.status] || statusColors.Draft}`}>
                      {inv.status}
                    </span>
                    <span className="text-sm font-black">
                      {fmt(inv.totalAmount)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Active Projects */}
        <div className="bg-white border-2 border-black">
          <div className="px-5 py-4 border-b-2 border-black flex justify-between items-center bg-black text-white">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" strokeWidth={2} />
              <h2 className="text-xs font-black uppercase tracking-widest">Active Projects</h2>
            </div>
            <Link
              to="/projects"
              className="text-[10px] font-black uppercase border border-white px-2 py-0.5 hover:bg-white hover:text-black transition-colors"
            >
              All Files
            </Link>
          </div>

          {loading ? (
            <div className="p-5 space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 border border-black" />
              ))}
            </div>
          ) : recentProjects.length === 0 ? (
            <div className="p-8 text-center bg-white">
              <Briefcase className="h-10 w-10 text-black opacity-20 mx-auto" strokeWidth={1} />
              <p className="text-xs font-black uppercase tracking-widest mt-4">Project log empty</p>
            </div>
          ) : (
            <ul className="divide-y divide-black">
              {recentProjects.map((p) => (
                <li key={p._id} className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-black hover:text-white transition-colors group text-black">
                  <div className="min-w-0">
                    <p className="text-sm font-black truncate uppercase">{p.name}</p>
                    <p className="text-[10px] font-bold opacity-60 truncate uppercase">
                      {p.client?.name || '—'}
                      {p.deadline ? ` · DUE ${new Date(p.deadline).toLocaleDateString()}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className={`text-[10px] py-0.5 font-black uppercase border ${projectStatusColors[p.status] || 'border-black'}`}>
                      {p.status}
                    </span>
                    {p.budget && (
                      <span className="text-sm font-black">
                        {fmt(p.budget)}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ── quick actions ── */}
      <div className="border-4 border-black p-8 flex flex-col sm:flex-row items-center justify-between gap-8 bg-black text-white">
        <div>
          <p className="font-black text-2xl uppercase tracking-tighter">Ready to settle?</p>
          <p className="text-xs font-bold uppercase tracking-widest mt-2 opacity-60">
            Generate documents in single click.
          </p>
        </div>
        <div className="flex gap-4 shrink-0 w-full sm:w-auto">
          <Link
            to="/clients"
            className="flex-1 sm:flex-none text-center px-8 py-3 border-2 border-white text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
          >
            Add Client
          </Link>
          <Link
            to="/invoices"
            className="flex-1 sm:flex-none text-center px-8 py-3 bg-white text-black text-xs font-black uppercase tracking-widest hover:invert transition-all"
          >
            New Invoice
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;