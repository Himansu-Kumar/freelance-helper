import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: [true, 'Please add a name'] },
  email: { 
    type: String, 
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ] 
  },
  company: { type: String },
  phone: { type: String },
  address: { type: String },
  notes: { type: String },
  previousProjects: [{
    name: { type: String },
    completedDate: { type: Date },
    description: { type: String }
  }],
  payments: [{
    amount: { type: Number },
    date: { type: Date },
    status: { type: String, enum: ['Paid', 'Pending', 'Overdue'], default: 'Paid' },
    description: { type: String }
  }]
}, {
  timestamps: true
});

export default mongoose.model('Client', clientSchema);
