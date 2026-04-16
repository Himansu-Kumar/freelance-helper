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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl my-8">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 sticky top-0 rounded-t-xl z-10">
          <h2 className="text-xl font-semibold text-gray-800">{editData ? 'Edit Invoice' : 'Create New Invoice'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
                <select required name="client" value={formData.client} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="" disabled>Select a client</option>
                  {clients.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project (Optional)</label>
                <select name="project" value={formData.project} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">No Project</option>
                  {filteredProjects.map(p => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                <input required type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="Draft">Draft</option>
                  <option value="Sent">Sent</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 py-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Line Items</h3>
              <button type="button" onClick={addLineItem} className="flex items-center gap-1 text-sm text-indigo-600 font-medium hover:text-indigo-800 transition-colors">
                <Plus className="h-4 w-4" /> Add Item
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-100">
              <div className="hidden md:grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 mb-2 px-2">
                <div className="col-span-6">Description</div>
                <div className="col-span-2">Qty</div>
                <div className="col-span-2">Rate ($)</div>
                <div className="col-span-2 text-right">Amount</div>
              </div>

              {formData.lineItems.map((item, index) => (
                <div key={index} className="flex flex-col md:grid md:grid-cols-12 gap-4 items-center bg-white p-3 rounded border border-gray-200">
                  <div className="col-span-12 md:col-span-6 w-full">
                    <input required type="text" placeholder="Item description" value={item.description} onChange={(e) => handleLineItemChange(index, 'description', e.target.value)} className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div className="col-span-4 md:col-span-2 w-full">
                    <input required type="number" min="1" placeholder="Qty" value={item.quantity} onChange={(e) => handleLineItemChange(index, 'quantity', Number(e.target.value))} className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div className="col-span-4 md:col-span-2 w-full">
                    <input required type="number" min="0" step="0.01" placeholder="Rate" value={item.rate} onChange={(e) => handleLineItemChange(index, 'rate', Number(e.target.value))} className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div className="col-span-4 md:col-span-2 w-full flex justify-between md:justify-end items-center gap-4">
                    <span className="font-semibold text-gray-700 md:w-full md:text-right">${(item.quantity * item.rate).toFixed(2)}</span>
                    <button type="button" onClick={() => removeLineItem(index)} className="text-red-400 hover:text-red-600 transition-colors" disabled={formData.lineItems.length === 1}>
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-4">
              <div className="text-right w-48">
                <div className="flex justify-between items-center text-gray-600 mb-2">
                  <span>Subtotal:</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total:</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Terms</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows="2" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Thank you for your business!"></textarea>
          </div>
          
          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors">Cancel</button>
            <button type="submit" disabled={loading || clients.length === 0} className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors disabled:opacity-50">
              {loading ? 'Saving...' : (editData ? 'Update Invoice' : 'Create Invoice')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceModal;
