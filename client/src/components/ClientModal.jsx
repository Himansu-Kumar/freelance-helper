import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { X } from 'lucide-react';

const ClientModal = ({ isOpen, onClose, refreshData, editData }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    address: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name || '',
        email: editData.email || '',
        company: editData.company || '',
        phone: editData.phone || '',
        address: editData.address || '',
        notes: editData.notes || ''
      });
    } else {
      setFormData({ name: '', email: '', company: '', phone: '', address: '', notes: '' });
    }
  }, [editData, isOpen]);

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
        await api.put(`/clients/${editData._id}`, formData);
      } else {
        await api.post('/clients', formData);
      }
      if(refreshData) refreshData();
      onClose();
      // Reset form
      setFormData({ name: '', email: '', company: '', phone: '', address: '', notes: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/80 backdrop-blur-sm">
      <div className="bg-white border-4 border-black w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b-4 border-black flex justify-between items-center bg-white">
          <h2 className="text-2xl font-black text-black uppercase tracking-tighter">{editData ? 'Edit Client' : 'New Client'}</h2>
          <button onClick={onClose} className="text-black hover:bg-black hover:text-white p-1 border-2 border-transparent hover:border-black transition-colors">
            <X className="h-6 w-6" strokeWidth={3} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && <div className="bg-black text-white p-4 font-bold uppercase text-xs">{error}</div>}
          
          <div>
            <label className="block text-xs font-black text-black uppercase mb-1 tracking-widest">Client Name *</label>
            <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 border-2 border-black bg-white focus:bg-black focus:text-white transition-colors outline-none font-bold uppercase" placeholder="ACME CORP" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black text-black uppercase mb-1 tracking-widest">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 border-2 border-black bg-white focus:bg-black focus:text-white transition-colors outline-none font-bold uppercase" placeholder="CONTACT@ACME.COM" />
            </div>
            <div>
              <label className="block text-xs font-black text-black uppercase mb-1 tracking-widest">Phone</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 border-2 border-black bg-white focus:bg-black focus:text-white transition-colors outline-none font-bold" placeholder="+1234567890" />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-black text-black uppercase mb-1 tracking-widest">Address</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-3 border-2 border-black bg-white focus:bg-black focus:text-white transition-colors outline-none font-bold uppercase" placeholder="123 MAIN ST, CITY" />
          </div>
          
          <div>
            <label className="block text-xs font-black text-black uppercase mb-1 tracking-widest">Notes</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3" className="w-full px-4 py-3 border-2 border-black bg-white focus:bg-black focus:text-white transition-colors outline-none font-bold uppercase" placeholder="INTERNAL NOTES..."></textarea>
          </div>
          
          <div className="pt-6 border-t-4 border-black flex justify-end gap-4 mt-8">
            <button type="button" onClick={onClose} className="px-6 py-2 bg-white border-2 border-black text-black font-black uppercase tracking-widest hover:bg-black hover:text-white transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-8 py-2 bg-black text-white border-2 border-black font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-25">
              {loading ? 'SAVING...' : 'Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientModal;
