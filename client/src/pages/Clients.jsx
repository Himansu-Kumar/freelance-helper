import React, { useState, useEffect } from 'react';
import { Plus, Users, Search, Trash2, Edit, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import ClientModal from '../components/ClientModal';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await api.get('/clients');
      setClients(res.data.data);
    } catch (error) {
      console.error('Error fetching clients', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this client? All related projects will also be deleted.')) {
      try {
        await api.delete(`/clients/${id}`);
        setClients(clients.filter(client => client._id !== id));
      } catch (error) {
        console.error('Error deleting client', error);
        alert('Failed to delete client due to a server error.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-2 border-black pb-4">
        <div>
          <h1 className="text-3xl font-black text-black uppercase tracking-tighter">Clients</h1>
          <p className="text-sm text-black font-bold uppercase tracking-widest">Active Accounts</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-black text-white px-6 py-2 border-2 border-black hover:bg-white hover:text-black transition-colors text-sm font-black uppercase">
          <Plus className="h-4 w-4" strokeWidth={3} />
          Add Client
        </button>
      </div>

      <div className="bg-white border-2 border-black p-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-black" strokeWidth={2} />
            </div>
            <input
              type="text"
              placeholder="SEARCH CLIENTS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border-2 border-black bg-white text-black placeholder-black/30 outline-none font-bold uppercase text-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10 text-black font-black uppercase tracking-widest">Loading...</div>
        ) : clients.length === 0 ? (
          <div className="text-center py-16 px-4 border border-black border-dashed">
            <Users className="mx-auto h-12 w-12 text-black" strokeWidth={1} />
            <h3 className="mt-4 text-sm font-black text-black uppercase">Client log empty</h3>
            <div className="mt-6">
              <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 mx-auto bg-black text-white px-6 py-2 border-2 border-black hover:bg-white hover:text-black transition-colors text-sm font-black uppercase">
                <Plus className="h-4 w-4" strokeWidth={3} />
                Add Client
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y-2 divide-black">
              <thead className="bg-black">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-black text-white uppercase tracking-widest">Client</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-black text-white uppercase tracking-widest">Contact</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-black text-white uppercase tracking-widest">Added</th>
                  <th scope="col" className="relative px-6 py-4"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-black">
                {clients.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || (c.company && c.company.toLowerCase().includes(searchQuery.toLowerCase()))).map((client) => (
                  <tr key={client._id} className="hover:bg-black hover:text-white transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 border-2 border-black bg-white group-hover:bg-black group-hover:border-white flex items-center justify-center text-black group-hover:text-white font-black text-lg transition-colors">
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-black uppercase tracking-tight">{client.name}</div>
                          <div className="text-xs font-bold uppercase opacity-60 tracking-tighter">{client.company}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold">{client.email}</div>
                      <div className="text-xs opacity-60">{client.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                      {new Date(client.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-4 items-center">
                      <Link 
                        to={`/clients/${client._id}`}
                        className="p-1 border-2 border-black group-hover:border-white text-black group-hover:text-white hover:invert transition-all"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" strokeWidth={2} />
                      </Link>
                      <button 
                        onClick={() => { setEditClient(client); setIsModalOpen(true); }}
                        className="p-1 border-2 border-black group-hover:border-white text-black group-hover:text-white hover:invert transition-all"
                        title="Edit Client"
                      >
                        <Edit className="h-4 w-4" strokeWidth={2} />
                      </button>
                      <button 
                        onClick={() => handleDelete(client._id)}
                        className="p-1 border-2 border-black group-hover:border-white text-black group-hover:text-white hover:invert transition-all"
                        title="Delete Client"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={2} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ClientModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditClient(null); }} 
        refreshData={fetchClients} 
        editData={editClient}
      />
    </div>
  );
};

export default Clients;
