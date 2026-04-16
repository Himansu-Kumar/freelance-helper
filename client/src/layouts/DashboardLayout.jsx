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
    `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
      isActive
        ? 'bg-indigo-50 text-indigo-600'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* ── Sidebar ── */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <span className="text-xl font-bold text-indigo-600 flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6" />
            FreelanceHub
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className={navCls}>
              <Icon className="mr-3 h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer — user info + settings + sign out */}
        <div className="p-4 border-t border-gray-200 space-y-1">
          {/* Clicking the user block navigates to settings */}
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-2 py-2 rounded-md transition-colors cursor-pointer ${
                isActive ? 'bg-indigo-50' : 'hover:bg-gray-50'
              }`
            }
          >
            <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-700 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
            <Settings className="h-4 w-4 text-gray-400 shrink-0" />
          </NavLink>

          <button
            onClick={logout}
            className="flex items-center w-full px-2 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:hidden">
          <span className="text-xl font-bold text-indigo-600">FreelanceHub</span>
          <div className="flex items-center gap-3">
            <NavLink to="/settings" className="text-gray-500 hover:text-indigo-600 transition-colors">
              <Settings className="h-5 w-5" />
            </NavLink>
            <button onClick={logout} className="text-gray-600">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;