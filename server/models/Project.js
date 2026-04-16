import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  name: { type: String, required: [true, 'Please add a project name'] },
  description: { type: String },
  status: { 
    type: String, 
    enum: ['Active', 'Completed', 'On Hold', 'Cancelled'], 
    default: 'Active' 
  },
  deadline: { type: Date },
  budget: { type: Number }
}, {
  timestamps: true
});

export default mongoose.model('Project', projectSchema);
