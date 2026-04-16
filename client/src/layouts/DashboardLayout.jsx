import React from 'react';
import { Navigate, Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, Users, Briefcase, FileText, Settings } from 'lucide-react';

const DashboardLayout = () => {
  const { user, loading, logout } = useAuth();

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  if (!user) return <Navigate to="/login" />;

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/clients',   icon: Users,           label: 'Clients'   },
    { to: '/projects',  icon: Briefcase,        label: 'Projects'  },
    { to: '/invoices',  icon: FileText,         label: 'Invoices'  },
  ];

  const navCls = ({ isActive }) =>
    `group flex items-center px-2 py-2 text-sm font-medium border border-black transition-colors ${
      isActive
        ? 'bg-black text-white'
        : 'text-black hover:bg-black hover:text-white'
    }`;

  return (
    <div className="flex h-screen bg-white">
      {/* ── Sidebar ── */}
      <aside className="hidden md:flex md:flex-col w-64 border-r border-black bg-white">
        <div className="h-16 flex items-center px-6 border-b border-black">
          <span className="text-xl font-bold text-black flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6" strokeWidth={2} />
            FREELANCEHUB
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-4 space-y-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className={navCls}>
              <Icon className="mr-3 h-5 w-5" strokeWidth={1.5} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer — user info + settings + sign out */}
        <div className="p-4 border-t border-black space-y-2">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-2 py-2 border border-black transition-colors cursor-pointer ${
                isActive ? 'bg-black text-white' : 'hover:bg-black hover:text-white'
              }`
            }
          >
            <div className="h-8 w-8 border border-black flex items-center justify-center text-sm font-bold shrink-0">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold truncate">{user.name}</p>
              <p className="text-xs truncate">{user.email}</p>
            </div>
            <Settings className="h-4 w-4 shrink-0" strokeWidth={1.5} />
          </NavLink>

          <button
            onClick={logout}
            className="flex items-center w-full px-2 py-2 text-sm font-medium border border-black hover:bg-black hover:text-white transition-colors"
          >
            <LogOut className="mr-2 h-4 w-4" strokeWidth={1.5} />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col overflow-hidden bg-white">
        <header className="h-16 bg-white border-b border-black flex items-center justify-between px-4 md:hidden">
          <span className="text-xl font-bold text-black">FREELANCEHUB</span>
          <div className="flex items-center gap-3">
            <NavLink to="/settings" className="text-black hover:bg-black hover:text-white p-1 border border-black transition-colors">
              <Settings className="h-5 w-5" strokeWidth={1.5} />
            </NavLink>
            <button onClick={logout} className="text-black hover:bg-black hover:text-white p-1 border border-black transition-colors">
              <LogOut className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6 bg-white">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;