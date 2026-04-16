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

  if (loading) return <div className="text-center py-20 text-black font-black uppercase tracking-widest">Loading entry...</div>;
  if (error || !client) return <div className="text-center py-20 text-white bg-black font-black uppercase tracking-widest">{error || 'Record Not Found'}</div>;

  const totalRevenue = invoices
    .filter(inv => inv.status === 'Paid')
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  const activeProjects = projects.filter(p => p.status === 'Active').length;

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-6 border-b-4 border-black pb-6">
        <button onClick={() => navigate('/clients')} className="p-2 border-2 border-black hover:bg-black hover:text-white transition-colors">
          <ArrowLeft className="h-6 w-6" strokeWidth={3} />
        </button>
        <div>
          <h1 className="text-4xl font-black text-black uppercase tracking-tighter">Profile</h1>
          <p className="text-xs font-black text-black uppercase tracking-widest opacity-60">Account Details</p>
        </div>
      </div>

      {/* Client Summary Card */}
      <div className="bg-white border-4 border-black p-8 flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-8">
             <div className="flex items-center gap-6">
               <div className="h-20 w-20 flex-shrink-0 border-4 border-black bg-black text-white flex items-center justify-center text-4xl font-black">
                 {client.name.charAt(0).toUpperCase()}
               </div>
               <div>
                 <h2 className="text-3xl font-black text-black uppercase tracking-tighter">{client.name}</h2>
                 {client.company && <div className="text-xs font-bold uppercase opacity-60 flex items-center gap-2 mt-2 tracking-widest"><Building className="h-4 w-4" strokeWidth={2}/> {client.company}</div>}
               </div>
             </div>
             <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-black text-white px-6 py-2 border-4 border-black hover:bg-white hover:text-black transition-colors text-xs font-black uppercase tracking-widest">
               <Edit className="h-4 w-4" strokeWidth={2.5}/>
               Edit
             </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 mt-8">
            {client.email && (
              <div className="flex items-center gap-3 text-black font-bold uppercase tracking-widest text-[10px]">
                <Mail className="h-4 w-4" strokeWidth={2.5} />
                <a href={`mailto:${client.email}`} className="underline">{client.email}</a>
              </div>
            )}
            {client.phone && (
              <div className="flex items-center gap-3 text-black font-bold uppercase tracking-widest text-[10px]">
                <Phone className="h-4 w-4" strokeWidth={2.5} />
                <a href={`tel:${client.phone}`} className="underline">{client.phone}</a>
              </div>
            )}
            {client.address && (
              <div className="flex items-center gap-3 text-black font-bold uppercase tracking-widest text-[10px] md:col-span-2">
                <MapPin className="h-4 w-4" strokeWidth={2.5} />
                <span className="opacity-60">{client.address}</span>
              </div>
            )}
          </div>
        </div>

        <div className="md:w-72 flex flex-col gap-6 border-t-2 md:border-t-0 md:border-l-2 border-black pt-8 md:pt-0 md:pl-8">
          <div className="bg-black p-6 text-white border-4 border-black">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Total Revenue</div>
            <div className="mt-2 text-4xl font-black tracking-tighter">${totalRevenue.toLocaleString()}</div>
          </div>
          <div className="bg-white p-6 border-4 border-black flex justify-between items-center">
            <div className="text-xs font-black uppercase tracking-widest">Active Projects</div>
            <div className="text-2xl font-black">{activeProjects}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects List */}
        <div className="bg-white border-4 border-black p-8">
          <div className="flex justify-between items-center mb-8 border-b-2 border-black pb-4">
            <h3 className="text-xl font-black text-black uppercase tracking-widest flex items-center gap-3">
              <Briefcase className="h-6 w-6" strokeWidth={3}/> 
              Log:Projects
            </h3>
            <span className="bg-black text-white text-xs py-1 px-3 font-black">{projects.length}</span>
          </div>
          
          {projects.length === 0 ? (
            <div className="text-[10px] font-black uppercase tracking-widest opacity-40 py-8">Record_Set:Empty</div>
          ) : (
            <div className="space-y-4">
              {projects.map(project => (
                <div key={project._id} className="border-2 border-black p-5 hover:bg-black hover:text-white transition-all cursor-default group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="font-black uppercase text-sm tracking-widest">{project.name}</div>
                    <span className={`text-[10px] px-2 py-0.5 border-2 font-black uppercase ${project.status === 'Active' ? 'border-black bg-white group-hover:bg-black group-hover:text-white' : 'bg-black text-white group-hover:bg-white group-hover:text-black hover:invert transition-all'}`}>
                      {project.status}
                    </span>
                  </div>
                  {project.budget && <div className="text-[10px] font-bold uppercase opacity-60 tracking-widest">Entry: ${project.budget.toLocaleString()}</div>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Invoices List */}
        <div className="bg-white border-4 border-black p-8">
          <div className="flex justify-between items-center mb-8 border-b-2 border-black pb-4">
            <h3 className="text-xl font-black text-black uppercase tracking-widest flex items-center gap-3">
               <FileText className="h-6 w-6" strokeWidth={3}/>
               Log:Invoices
            </h3>
            <span className="bg-black text-white text-xs py-1 px-3 font-black">{invoices.length}</span>
          </div>

          {invoices.length === 0 ? (
            <div className="text-[10px] font-black uppercase tracking-widest opacity-40 py-8">Record_Set:Empty</div>
          ) : (
            <div className="space-y-4">
              {invoices.map(invoice => (
                <div key={invoice._id} className="border-2 border-black p-5 flex justify-between items-center hover:bg-black hover:text-white transition-all group cursor-default">
                  <div>
                    <div className="font-black text-black group-hover:text-white uppercase text-xs tracking-tighter">{invoice.invoiceNumber}</div>
                    <div className="text-[10px] font-bold uppercase opacity-60 mt-1">Due: {new Date(invoice.dueDate).toLocaleDateString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-lg tracking-tighter">${invoice.totalAmount.toLocaleString()}</div>
                    <span className={`inline-block mt-2 text-[10px] uppercase font-black tracking-[0.2em] px-2 py-0.5 border-2 ${
                      invoice.status === 'Paid' ? 'border-2 border-black bg-white text-black group-hover:bg-white' : 
                      invoice.status === 'Overdue' ? 'bg-black text-white group-hover:bg-white group-hover:text-black border-2 border-black' : 
                      'border-black border-dashed opacity-60'
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
