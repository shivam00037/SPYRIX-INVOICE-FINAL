import mongoose from 'mongoose';

const quotationSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  quotationNumber: { type: String, required: true, trim: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  customerSnapshot: { type: mongoose.Schema.Types.Mixed, default: {} },
  items: { type: [mongoose.Schema.Types.Mixed], default: [] },
  totalPaise: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['draft', 'sent', 'accepted', 'rejected', 'expired'], default: 'draft' },
  validUntil: { type: Date },
  notes: { type: String, default: '' },
}, { timestamps: true });
quotationSchema.index({ businessId: 1, quotationNumber: 1 }, { unique: true });
export default mongoose.model('Quotation', quotationSchema);
