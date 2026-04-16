import React, { useState, useEffect } from 'react';
import { Plus, FileText, Search, Download, Trash2, Edit } from 'lucide-react';
import api from '../utils/api';
import InvoiceModal from '../components/InvoiceModal';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAuth } from '../context/AuthContext';

const Invoices = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editInvoice, setEditInvoice] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

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
      case 'Draft': return 'border-black text-black';
      case 'Sent': return 'bg-black text-white';
      case 'Paid': return 'border-2 border-black text-black font-bold';
      case 'Overdue': return 'bg-white text-black border border-dashed border-black';
      default: return 'border-black text-black';
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
    doc.text('Bill From:', 14, 55);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(user?.businessName || user?.name || 'Your Name', 14, 61);
    doc.text(user?.email || '', 14, 67);
    if (user?.address) doc.text(user.address, 14, 73);
    if (user?.taxId) doc.text(`Tax ID: ${user.taxId}`, 14, 79);

    doc.setTextColor(0);
    doc.setFontSize(12);
    doc.text('Bill To:', 120, 55);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(invoice.client?.name || 'N/A', 120, 61);
    if (invoice.client?.company) doc.text(invoice.client.company, 120, 67);
    if (invoice.client?.email) doc.text(invoice.client.email, 120, 73);

    const tableColumn = ["Description", "Quantity", "Rate", "Amount"];
    const tableRows = [];

    invoice.lineItems.forEach(item => {
      const amount = (item.quantity * item.rate).toFixed(2);
      tableRows.push([item.description, item.quantity, `$${item.rate.toFixed(2)}`, `$${amount}`]);
    });

    autoTable(doc, {
      startY: 95,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] }
    });

    const finalY = doc.lastAutoTable?.finalY || 85;
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-2 border-black pb-4">
        <div>
          <h1 className="text-3xl font-black text-black uppercase tracking-tighter">Invoices</h1>
          <p className="text-sm text-black">MONOCHROME BILLING SYSTEM</p>
        </div>
        <button onClick={openAddModal} className="flex items-center gap-2 bg-black hover:bg-white hover:text-black border border-black text-white px-6 py-2 transition-colors text-sm font-bold uppercase">
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          Create Invoice
        </button>
      </div>

      <div className="bg-white p-4 border-2 border-black">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-black" strokeWidth={1.5} />
            </div>
            <input
              type="text"
              placeholder="SEARCH INVOICES..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border-2 border-black bg-white text-black placeholder-black/50 focus:outline-none sm:text-sm uppercase font-bold"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10 text-black font-bold">LOADING...</div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-16 px-4 border border-black border-dashed">
            <FileText className="mx-auto h-12 w-12 text-black" strokeWidth={1} />
            <h3 className="mt-2 text-sm font-bold text-black uppercase">No invoices found</h3>
            <p className="mt-1 text-sm text-black">The ledger is empty.</p>
            <div className="mt-6">
              <button onClick={openAddModal} className="flex items-center gap-2 mx-auto bg-black text-white px-6 py-2 border border-black hover:bg-white hover:text-black transition-colors text-sm font-bold uppercase">
                <Plus className="h-4 w-4" strokeWidth={2.5} />
                Create Invoice
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y-2 divide-black border-collapse">
              <thead>
                <tr className="bg-black text-white">
                  <th scope="col" className="px-6 py-3 text-left text-xs font-black uppercase tracking-widest">ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-black uppercase tracking-widest">Client</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-black uppercase tracking-widest">Amount</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-black uppercase tracking-widest">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-black uppercase tracking-widest">Due</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y border-black">
                {invoices.filter(i => (i.invoiceNumber && i.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())) || (i.client?.name && i.client.name.toLowerCase().includes(searchQuery.toLowerCase()))).map((invoice) => (
                  <tr key={invoice._id} className="hover:bg-black hover:text-white transition-colors border-b border-black group">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold">{invoice.client?.name || 'Unknown Client'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-black">
                      ${invoice.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-black border ${getStatusColor(invoice.status)} uppercase`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-3 items-center">
                       <button onClick={() => generatePDF(invoice)} className="text-black group-hover:text-white transition-colors p-1 border border-transparent hover:border-black" title="Download PDF">
                          <Download className="h-5 w-5" strokeWidth={1.5} />
                       </button>
                       <button onClick={() => { setEditInvoice(invoice); setIsModalOpen(true); }} className="text-black group-hover:text-white transition-colors p-1 border border-transparent hover:border-black" title="Edit Invoice">
                         <Edit className="h-4 w-4" strokeWidth={1.5} />
                       </button>
                      <button onClick={() => handleDelete(invoice._id)} className="text-black group-hover:text-white transition-colors p-1 border border-transparent hover:border-black" title="Delete Invoice">
                        <Trash2 className="h-5 w-5" strokeWidth={1.5} />
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
