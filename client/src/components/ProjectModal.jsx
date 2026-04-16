import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { X } from 'lucide-react';

const ProjectModal = ({ isOpen, onClose, refreshData, editData }) => {
  const [formData, setFormData] = useState({
    name: '',
    client: '',
    description: '',
    status: 'Active',
    budget: '',
    deadline: ''
  });
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const initForm = async () => {
        await fetchClients();
        if (editData) {
          setFormData({
            name: editData.name || '',
            client: editData.client?._id || editData.client || '',
            description: editData.description || '',
            status: editData.status || 'Active',
            budget: editData.budget || '',
            deadline: editData.deadline ? new Date(editData.deadline).toISOString().split('T')[0] : ''
          });
        }
      };
      initForm();
    } else {
      setFormData({ name: '', client: '', description: '', status: 'Active', budget: '', deadline: '' });
    }
  }, [isOpen, editData]);

  const fetchClients = async () => {
    try {
      const res = await api.get('/clients');
      setClients(res.data.data);
      if (res.data.data.length > 0 && !formData.client) {
        setFormData(prev => ({ ...prev, client: res.data.data[0]._id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (editData) {
        await api.put(`/projects/${editData._id}`, formData);
      } else {
        await api.post('/projects', formData);
      }
      if(refreshData) refreshData();
      onClose();
      // Reset handled by useEffect on close
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/80 backdrop-blur-sm">
      <div className="bg-white border-4 border-black w-full max-lg overflow-hidden">
        <div className="px-6 py-4 border-b-4 border-black flex justify-between items-center bg-white">
          <h2 className="text-2xl font-black text-black uppercase tracking-tighter">{editData ? 'Edit Project' : 'New Project'}</h2>
          <button onClick={onClose} className="text-black hover:bg-black hover:text-white p-1 border-2 border-transparent hover:border-black transition-colors">
            <X className="h-6 w-6" strokeWidth={3} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && <div className="bg-black text-white p-4 font-bold uppercase text-xs">{error}</div>}
          
          <div>
            <label className="block text-xs font-black text-black uppercase mb-1 tracking-widest">Project Name *</label>
            <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 border-2 border-black bg-white focus:bg-black focus:text-white transition-colors outline-none font-bold uppercase" placeholder="WEBSITE REDESIGN" />
          </div>
          
          <div>
            <label className="block text-xs font-black text-black uppercase mb-1 tracking-widest">Client *</label>
            <select required name="client" value={formData.client} onChange={handleChange} className="w-full px-4 py-3 border-2 border-black bg-white focus:bg-black focus:text-white transition-colors outline-none font-bold uppercase">
              <option value="" disabled>Select Client</option>
              {clients.map(c => (
                <option key={c._id} value={c._id}>{c.name} {c.company ? `(${c.company})` : ''}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-black text-black uppercase mb-1 tracking-widest">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="2" className="w-full px-4 py-3 border-2 border-black bg-white focus:bg-black focus:text-white transition-colors outline-none font-bold uppercase" placeholder="PROJECT SCOPE..."></textarea>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-black text-black uppercase mb-1 tracking-widest">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-3 border-2 border-black bg-white focus:bg-black focus:text-white transition-colors outline-none font-bold uppercase">
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-black uppercase mb-1 tracking-widest">Budget</label>
              <input type="number" name="budget" value={formData.budget} onChange={handleChange} className="w-full px-4 py-3 border-2 border-black bg-white focus:bg-black focus:text-white transition-colors outline-none font-bold" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-xs font-black text-black uppercase mb-1 tracking-widest">Deadline</label>
              <input type="date" name="deadline" value={formData.deadline} onChange={handleChange} className="w-full px-4 py-3 border-2 border-black bg-white focus:bg-black focus:text-white transition-colors outline-none font-bold" />
            </div>
          </div>
          
          <div className="pt-6 border-t-4 border-black flex justify-end gap-4 mt-8">
            <button type="button" onClick={onClose} className="px-6 py-2 bg-white border-2 border-black text-black font-black uppercase tracking-widest hover:bg-black hover:text-white transition-colors">Cancel</button>
            <button type="submit" disabled={loading || clients.length === 0} className="px-8 py-2 bg-black text-white border-2 border-black font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-25">
              {loading ? 'SAVING...' : 'Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;
