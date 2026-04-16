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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-semibold text-gray-800">{editData ? 'Edit Project' : 'Add New Project'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
            <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Website Redesign" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
            <select required name="client" value={formData.client} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="" disabled>Select a client</option>
              {clients.map(c => (
                <option key={c._id} value={c._id}>{c.name} {c.company ? `(${c.company})` : ''}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="2" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Project scope..."></textarea>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget ($)</label>
              <input type="number" name="budget" value={formData.budget} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="5000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
              <input type="date" name="deadline" value={formData.deadline} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors">Cancel</button>
            <button type="submit" disabled={loading || clients.length === 0} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors disabled:opacity-50">
              {loading ? 'Saving...' : (editData ? 'Update Project' : 'Save Project')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;
