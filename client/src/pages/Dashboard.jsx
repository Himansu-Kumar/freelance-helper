import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ revenue: 0, activeProjects: 0, unpaidInvoices: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [projectsRes, invoicesRes] = await Promise.all([
          api.get('/projects'),
          api.get('/invoices')
        ]);
        
        const projects = projectsRes.data.data;
        const invoices = invoicesRes.data.data;

        const activeProjectsCount = projects.filter(p => p.status === 'Active').length;
        
        let totalRev = 0;
        let unpaidCount = 0;
        
        invoices.forEach(inv => {
          if (inv.status === 'Paid') {
            totalRev += inv.totalAmount;
          } else {
            unpaidCount += 1;
          }
        });

        setStats({
          revenue: totalRev,
          activeProjects: activeProjectsCount,
          unpaidInvoices: unpaidCount
        });
      } catch (error) {
        console.error('Error fetching dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);
  
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      <p className="mt-2 text-gray-600">Welcome back, {user?.name}! Here is an overview of your freelance business.</p>
      
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Placeholder cards */}
        <div className="bg-white overflow-hidden shadow rounded-xl border border-gray-100">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 truncate">Total Revenue</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">
                  {loading ? '...' : `$${stats.revenue.toLocaleString()}`}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-xl border border-gray-100">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 truncate">Active Projects</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">
                  {loading ? '...' : stats.activeProjects}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-xl border border-gray-100">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 truncate">Unpaid Invoices</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">
                  {loading ? '...' : stats.unpaidInvoices}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
