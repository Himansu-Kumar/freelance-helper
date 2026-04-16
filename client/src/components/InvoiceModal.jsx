import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { X, Plus, Trash2 } from 'lucide-react';

const InvoiceModal = ({ isOpen, onClose, refreshData, editData }) => {
  const [formData, setFormData] = useState({
    client: '',
    project: '',
    status: 'Draft',
    dueDate: '',
    notes: '',
    lineItems: [{ description: '', quantity: 1, rate: 0 }]
  });
  
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const initForm = async () => {
        try {
          const [clientsRes, projectsRes] = await Promise.all([
            api.get('/clients'),
            api.get('/projects')
          ]);
          setClients(clientsRes.data.data);
          setProjects(projectsRes.data.data);

          if (editData) {
            setFormData({
              client: editData.client?._id || editData.client || '',
              project: editData.project?._id || editData.project || '',
              status: editData.status || 'Draft',
              dueDate: editData.dueDate ? new Date(editData.dueDate).toISOString().split('T')[0] : '',
              notes: editData.notes || '',
              lineItems: editData.lineItems?.length > 0 ? editData.lineItems : [{ description: '', quantity: 1, rate: 0 }]
            });
          }
        } catch (err) {
          console.error(err);
        }
      };
      initForm();
    } else {
      setFormData({
        client: '',
        project: '',
        status: 'Draft',
        dueDate: '',
        notes: '',
        lineItems: [{ description: '', quantity: 1, rate: 0 }]
      });
      setError(null);
    }
  }, [isOpen, editData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLineItemChange = (index, field, value) => {
    const newItems = [...formData.lineItems];
    newItems[index][field] = value;
    setFormData({ ...formData, lineItems: newItems });
  };

  const addLineItem = () => {
    setFormData({
      ...formData,
      lineItems: [...formData.lineItems, { description: '', quantity: 1, rate: 0 }]
    });
  };

  const removeLineItem = (index) => {
    const newItems = formData.lineItems.filter((_, i) => i !== index);
    setFormData({ ...formData, lineItems: newItems });
  };

  const calculateTotal = () => {
    return formData.lineItems.reduce((acc, item) => acc + (item.quantity * item.rate), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.lineItems.length === 0) {
      setError('You must add at least one line item.');
      return;
    }

    setLoading(true);
    setError(null);
    
    // Clean up empty project field since it might not be required
    const payload = { ...formData };
    if (!payload.project) delete payload.project;

    try {
      if (editData) {
        await api.put(`/invoices/${editData._id}`, payload);
      } else {
        await api.post('/invoices', payload);
      }
      if (refreshData) refreshData();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = formData.client 
    ? projects.filter(p => !p.client || p.client._id === formData.client || p.client === formData.client)
    : projects;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/80 backdrop-blur-sm">
      <div className="bg-white border-4 border-black w-full max-w-4xl max-h-[90vh] flex flex-col relative">
        <div className="px-6 py-4 border-b-4 border-black flex justify-between items-center bg-white shrink-0">
          <div className="flex flex-col">
            <h2 className="text-3xl font-black text-black uppercase tracking-tighter leading-none">{editData ? 'Adjust Invoice' : 'New Entry'}</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-1 opacity-60">Accounting_Protocol_v1.0</p>
          </div>
          <button onClick={onClose} className="text-black hover:bg-black hover:text-white p-1 border-2 border-transparent hover:border-black transition-colors">
            <X className="h-8 w-8" strokeWidth={3} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          {error && <div className="bg-black text-white p-4 font-black uppercase text-xs border-2 border-black tracking-widest">{error}</div>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-black uppercase mb-1 tracking-[0.2em]">Client *</label>
                <select required name="client" value={formData.client} onChange={handleChange} className="w-full px-4 py-3 border-4 border-black bg-white focus:bg-black focus:text-white transition-colors outline-none font-bold uppercase text-xs">
                  <option value="" disabled>Select Client</option>
                  {clients.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-[10px] font-black text-black uppercase mb-1 tracking-[0.2em]">Project (Optional)</label>
                <select name="project" value={formData.project} onChange={handleChange} className="w-full px-4 py-3 border-4 border-black bg-white focus:bg-black focus:text-white transition-colors outline-none font-bold uppercase text-xs">
                  <option value="">No Project</option>
                  {filteredProjects.map(p => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-black uppercase mb-1 tracking-[0.2em]">Due Date *</label>
                <input required type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className="w-full px-4 py-3 border-4 border-black bg-white focus:bg-black focus:text-white transition-colors outline-none font-bold text-xs" />
              </div>

              <div>
                <label className="block text-[10px] font-black text-black uppercase mb-1 tracking-[0.2em]">Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-3 border-4 border-black bg-white focus:bg-black focus:text-white transition-colors outline-none font-bold uppercase text-xs">
                  <option value="Draft">Draft</option>
                  <option value="Sent">Sent</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>
            </div>
          </div>

          <div className="border-t-4 border-black py-6">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-black uppercase tracking-[0.2em]">Log:Entries</h3>
              <button type="button" onClick={addLineItem} className="flex items-center gap-2 px-6 py-2 bg-black border-4 border-black text-white text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors">
                <Plus className="h-4 w-4" strokeWidth={3} /> Record Item
              </button>
            </div>

            <div className="space-y-4">
              <div className="hidden md:grid grid-cols-12 gap-4 text-xs font-black text-black uppercase tracking-widest px-2">
                <div className="col-span-6">Description</div>
                <div className="col-span-2">Qty</div>
                <div className="col-span-2">Rate</div>
                <div className="col-span-2 text-right">Amount</div>
              </div>

                {formData.lineItems.map((item, index) => (
                <div key={index} className="flex flex-col md:grid md:grid-cols-12 gap-6 items-center border-4 border-black p-6 bg-white shrink-0">
                  <div className="col-span-12 md:col-span-6 w-full">
                    <input required type="text" placeholder="DESCRIPTION" value={item.description} onChange={(e) => handleLineItemChange(index, 'description', e.target.value)} className="w-full px-4 py-2 border-4 border-black outline-none focus:bg-black focus:text-white font-bold text-xs" />
                  </div>
                  <div className="col-span-4 md:col-span-2 w-full">
                    <input required type="number" min="1" placeholder="QTY" value={item.quantity} onChange={(e) => handleLineItemChange(index, 'quantity', Number(e.target.value))} className="w-full px-4 py-2 border-4 border-black outline-none focus:bg-black focus:text-white font-bold text-xs" />
                  </div>
                  <div className="col-span-4 md:col-span-2 w-full">
                    <input required type="number" min="0" step="0.01" placeholder="RATE" value={item.rate} onChange={(e) => handleLineItemChange(index, 'rate', Number(e.target.value))} className="w-full px-4 py-2 border-4 border-black outline-none focus:bg-black focus:text-white font-bold text-xs" />
                  </div>
                  <div className="col-span-4 md:col-span-2 w-full flex justify-between md:justify-end items-center gap-6">
                    <span className="font-black text-black md:w-full md:text-right text-xl tracking-tighter">${(item.quantity * item.rate).toLocaleString()}</span>
                    <button type="button" onClick={() => removeLineItem(index)} className="text-black hover:bg-black hover:text-white p-2 border-4 border-black transition-colors" disabled={formData.lineItems.length === 1}>
                      <Trash2 className="h-5 w-5" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-8 border-t-2 border-black pt-4">
              <div className="text-right w-64">
                <div className="flex justify-between items-center text-black font-bold uppercase text-xs mb-2">
                  <span>Subtotal:</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-2xl font-black text-black pt-2 border-t-4 border-black uppercase tracking-tighter">
                  <span>Total Due:</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-black uppercase mb-2 tracking-[0.2em]">Notes / Internal Terms</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows="2" className="w-full px-4 py-3 border-4 border-black bg-white focus:bg-black focus:text-white transition-colors outline-none font-bold uppercase text-xs" placeholder="ADDITIONAL_DATA..."></textarea>
          </div>
          
          <div className="pt-8 border-t-4 border-black flex justify-end gap-6 bg-white sticky bottom-0 mt-8 pb-2">
            <button type="button" onClick={onClose} className="px-8 py-3 bg-white border-4 border-black text-black font-black uppercase tracking-widest hover:bg-black hover:text-white transition-colors text-xs">Cancel</button>
            <button type="submit" disabled={loading || clients.length === 0} className="px-12 py-3 bg-black text-white border-4 border-black font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-25 text-xs">
              {loading ? 'PROCESSING...' : (editData ? 'Apply' : 'Generate')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceModal;
