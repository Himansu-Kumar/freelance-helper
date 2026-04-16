import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Briefcase, FileText, Mail, Phone, MapPin, Building, Edit } from 'lucide-react';
import api from '../utils/api';
import ClientModal from '../components/ClientModal';

const ClientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [client, setClient] = useState(null);
  const [projects, setProjects] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [clientRes, projectsRes, invoicesRes] = await Promise.all([
        api.get(`/clients/${id}`),
        api.get(`/clients/${id}/projects`),
        api.get('/invoices')
      ]);

      setClient(clientRes.data.data);
      setProjects(projectsRes.data.data);
      
      // Filter invoices for this client
      const clientInvoices = invoicesRes.data.data.filter(inv => inv.client && inv.client._id === id);
      setInvoices(clientInvoices);
    } catch (err) {
      console.error('Error fetching client details', err);
      setError('Failed to load client details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-10 text-gray-500">Loading client details...</div>;
  if (error || !client) return <div className="text-center py-10 text-red-500">{error || 'Client not found'}</div>;

  const totalRevenue = invoices
    .filter(inv => inv.status === 'Paid')
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  const activeProjects = projects.filter(p => p.status === 'Active').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <button onClick={() => navigate('/clients')} className="text-gray-500 hover:text-indigo-600 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Client Overview</h1>
      </div>

      {/* Client Summary Card */}
      <div className="bg-white p-6 justify-between rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-4">
               <div className="h-16 w-16 flex-shrink-0 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-bold">
                 {client.name.charAt(0).toUpperCase()}
               </div>
               <div>
                 <h2 className="text-xl font-bold text-gray-900">{client.name}</h2>
                 {client.company && <div className="text-gray-500 flex items-center gap-1 mt-1"><Building className="h-4 w-4"/> {client.company}</div>}
               </div>
             </div>
             <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium">
               <Edit className="h-4 w-4" />
               Edit
             </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 mt-6">
            {client.email && (
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Mail className="h-4 w-4 text-gray-400" />
                <a href={`mailto:${client.email}`} className="hover:text-indigo-600">{client.email}</a>
              </div>
            )}
            {client.phone && (
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Phone className="h-4 w-4 text-gray-400" />
                <a href={`tel:${client.phone}`} className="hover:text-indigo-600">{client.phone}</a>
              </div>
            )}
            {client.address && (
              <div className="flex items-center gap-2 text-gray-600 text-sm md:col-span-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>{client.address}</span>
              </div>
            )}
          </div>
        </div>

        <div className="md:w-64 flex flex-col gap-4 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-gray-500">Total Revenue</div>
            <div className="mt-1 text-2xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
            <div className="text-sm font-medium text-gray-500">Active Projects</div>
            <div className="text-xl font-bold text-indigo-600">{activeProjects}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects List */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-indigo-500"/> 
              Projects
            </h3>
            <span className="bg-gray-100 text-gray-600 text-xs py-1 px-2.5 rounded-full font-medium">{projects.length}</span>
          </div>
          
          {projects.length === 0 ? (
            <div className="text-sm text-gray-500 py-4">No projects found for this client.</div>
          ) : (
            <div className="space-y-3">
              {projects.map(project => (
                <div key={project._id} className="border border-gray-100 rounded-lg p-4 hover:border-indigo-100 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium text-gray-900">{project.name}</div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${project.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {project.status}
                    </span>
                  </div>
                  {project.budget && <div className="text-sm text-gray-500">Budget: ${project.budget.toLocaleString()}</div>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Invoices List */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
               <FileText className="h-5 w-5 text-indigo-500"/>
               Invoices
            </h3>
            <span className="bg-gray-100 text-gray-600 text-xs py-1 px-2.5 rounded-full font-medium">{invoices.length}</span>
          </div>

          {invoices.length === 0 ? (
            <div className="text-sm text-gray-500 py-4">No invoices found for this client.</div>
          ) : (
            <div className="space-y-3">
              {invoices.map(invoice => (
                <div key={invoice._id} className="border border-gray-100 rounded-lg p-4 flex justify-between items-center hover:border-indigo-100 transition-colors">
                  <div>
                    <div className="font-medium text-indigo-600 text-sm">{invoice.invoiceNumber}</div>
                    <div className="text-xs text-gray-500 mt-1">Due: {new Date(invoice.dueDate).toLocaleDateString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">${invoice.totalAmount.toLocaleString()}</div>
                    <span className={`inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                      invoice.status === 'Paid' ? 'bg-green-100 text-green-700' : 
                      invoice.status === 'Overdue' ? 'bg-red-100 text-red-700' : 
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {invoice.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ClientModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        refreshData={fetchData} 
        editData={client}
      />
    </div>
  );
};

export default ClientDetails;
