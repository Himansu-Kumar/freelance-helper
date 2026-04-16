import Invoice from '../models/Invoice.js';

export const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ user: req.user.id })
      .populate('client', 'name email company')
      .populate('project', 'name')
      .sort('-createdAt');
    res.status(200).json({ success: true, count: invoices.length, data: invoices });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

export const getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, user: req.user.id })
      .populate('client', 'name email company address phone text')
      .populate('project', 'name description');
    if (!invoice) {
        return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const createInvoice = async (req, res) => {
  try {
    req.body.user = req.user.id;
    const invoice = await Invoice.create(req.body);
    res.status(201).json({ success: true, data: invoice });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateInvoice = async (req, res) => {
  try {
    let invoice = await Invoice.findById(req.params.id);
    if (!invoice || invoice.user.toString() !== req.user.id) {
        return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    
    // Use .set() and .save() to trigger pre-save hooks (like total calculation)
    invoice.set(req.body);
    await invoice.save();
    
    res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice || invoice.user.toString() !== req.user.id) {
        return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    await invoice.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
