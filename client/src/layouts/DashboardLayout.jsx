import React from 'react';
import { Navigate, Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, Users, Briefcase, FileText } from 'lucide-react';

const DashboardLayout = () => {
  const { user, loading, logout } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!user) return <Navigate to="/login" />;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <span className="text-xl font-bold text-indigo-600 flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6" />
            FreelanceHub
          </span>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1">
          <NavLink to="/dashboard" className={({isActive}) => `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
            <LayoutDashboard className="mr-3 h-5 w-5" />
            Dashboard
          </NavLink>
          <NavLink to="/clients" className={({isActive}) => `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
            <Users className="mr-3 h-5 w-5" />
            Clients
          </NavLink>
          <NavLink to="/projects" className={({isActive}) => `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
            <Briefcase className="mr-3 h-5 w-5" />
            Projects
          </NavLink>
          <NavLink to="/invoices" className={({isActive}) => `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
            <FileText className="mr-3 h-5 w-5" />
            Invoices
          </NavLink>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div>
              <p className="text-sm font-medium text-gray-700">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-4 flex items-center w-full px-2 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:hidden">
            <span className="text-xl font-bold text-indigo-600">FreelanceHub</span>
            <button onClick={logout} className="text-gray-600">
                <LogOut className="h-5 w-5" />
            </button>
        </header>

        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
