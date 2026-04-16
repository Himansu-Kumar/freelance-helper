import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  invoiceNumber: { type: String, unique: true },
  status: { 
    type: String, 
    enum: ['Draft', 'Sent', 'Paid', 'Overdue'], 
    default: 'Draft' 
  },
  issueDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  lineItems: [{
    description: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    rate: { type: Number, required: true, min: 0 }
  }],
  totalAmount: { type: Number, default: 0 },
  notes: { type: String }
}, {
  timestamps: true
});

// Auto-increment invoiceNumber and calculate totalAmount before saving
invoiceSchema.pre('save', async function(next) {
  try {
    // Calculate total amount
    if (this.isModified('lineItems') && this.lineItems && this.lineItems.length > 0) {
      this.totalAmount = this.lineItems.reduce((acc, item) => acc + (item.quantity * item.rate), 0);
    }

    // Auto increment invoice number if new
    if (this.isNew) {
      const lastInvoice = await this.constructor.findOne({ user: this.user }).sort({ createdAt: -1 });
      if (lastInvoice && lastInvoice.invoiceNumber && lastInvoice.invoiceNumber.startsWith('INV-')) {
        const lastNum = parseInt(lastInvoice.invoiceNumber.split('-')[1]);
        if (!isNaN(lastNum)) {
          const nextNum = (lastNum + 1).toString().padStart(3, '0');
          this.invoiceNumber = `INV-${nextNum}`;
        } else {
          this.invoiceNumber = `INV-${Date.now().toString().slice(-4)}`;
        }
      } else {
        this.invoiceNumber = 'INV-001';
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.model('Invoice', invoiceSchema);
