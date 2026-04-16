import React, { useState, useEffect } from 'react';
import { Plus, FileText, Search, Download, Trash2, Edit } from 'lucide-react';
import api from '../utils/api';
import InvoiceModal from '../components/InvoiceModal';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editInvoice, setEditInvoice] = useState(null);

  const openAddModal = () => {
    setEditInvoice(null);
    setIsModalOpen(true);
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await api.get('/invoices');
      setInvoices(res.data.data);
    } catch (error) {
      console.error('Error fetching invoices', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Draft': return 'bg-gray-100 text-gray-800';
      case 'Sent': return 'bg-blue-100 text-blue-800';
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await api.delete(`/invoices/${id}`);
        setInvoices(invoices.filter(inv => inv._id !== id));
      } catch (error) {
        console.error('Error deleting invoice', error);
        alert('Failed to delete invoice.');
      }
    }
  };

  const generatePDF = (invoice) => {
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.text('INVOICE', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Invoice Number: ${invoice.invoiceNumber || 'Draft'}`, 14, 30);
    doc.text(`Issue Date: ${new Date(invoice.createdAt || invoice.issueDate || Date.now()).toLocaleDateString()}`, 14, 36);
    doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 14, 42);

    doc.setTextColor(0);
    doc.setFontSize(12);
    doc.text('Bill To:', 14, 55);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(invoice.client?.name || 'N/A', 14, 61);
    if (invoice.client?.company) doc.text(invoice.client.company, 14, 67);
    if (invoice.client?.email) doc.text(invoice.client.email, 14, 73);

    const tableColumn = ["Description", "Quantity", "Rate", "Amount"];
    const tableRows = [];

    invoice.lineItems.forEach(item => {
      const amount = (item.quantity * item.rate).toFixed(2);
      tableRows.push([item.description, item.quantity, `$${item.rate.toFixed(2)}`, `$${amount}`]);
    });

    doc.autoTable({
      startY: 85,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] }
    });

    const finalY = doc.lastAutoTable.finalY || 85;
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Total Amount: $${invoice.totalAmount.toLocaleString()}`, 14, finalY + 15);

    if (invoice.notes) {
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('Notes / Terms:', 14, finalY + 30);
      doc.text(invoice.notes, 14, finalY + 36, { maxWidth: 180 });
    }

    doc.save(`${invoice.invoiceNumber || 'Invoice'}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-sm text-gray-500">Manage billing and track your payments.</p>
        </div>
        <button onClick={openAddModal} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors text-sm font-medium">
          <Plus className="h-4 w-4" />
          Create Invoice
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by invoice number or client..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading invoices...</div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-16 px-4">
            <FileText className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No invoices</h3>
            <p className="mt-1 text-sm text-gray-500">No invoices generated yet.</p>
            <div className="mt-6">
              <button onClick={openAddModal} className="flex items-center gap-2 mx-auto bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors text-sm font-medium">
                <Plus className="h-4 w-4" />
                Create Invoice
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr key={invoice._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{invoice.client?.name || 'Unknown Client'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ${invoice.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-3 items-center">
                       <button onClick={() => generatePDF(invoice)} className="text-gray-400 hover:text-indigo-600 transition-colors" title="Download PDF">
                          <Download className="h-5 w-5" />
                       </button>
                       <button onClick={() => { setEditInvoice(invoice); setIsModalOpen(true); }} className="text-gray-400 hover:text-indigo-600 transition-colors" title="Edit Invoice">
                         <Edit className="h-4 w-4" />
                       </button>
                      <button onClick={() => handleDelete(invoice._id)} className="text-gray-400 hover:text-red-600 transition-colors" title="Delete Invoice">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <InvoiceModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditInvoice(null); }} 
        refreshData={fetchInvoices} 
        editData={editInvoice}
      />
    </div>
  );
};

export default Invoices;
