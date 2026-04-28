const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  ngo:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:       { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category:    { type: String, enum: ['food', 'medical', 'education', 'shelter', 'water', 'disaster', 'environment', 'other'], required: true },
  urgency:     { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  status:      { type: String, enum: ['active', 'funded', 'in_progress', 'completed', 'rejected'], default: 'active' },

  location: {
    address: { type: String, required: true },
    city:    { type: String, required: true },
    state:   { type: String, required: true },
    country: { type: String, default: 'India' },
    coords:  { lat: Number, lng: Number }
  },

  fundsRequired:  { type: Number, required: true, min: 0 },
  fundsRaised:    { type: Number, default: 0 },
  targetDate:     { type: Date },
  beneficiaries:  { type: Number, default: 0 },

  // Before-state images
  beforeImages: [{ type: String }],

  // Proof (after state)
  proof: { type: mongoose.Schema.Types.ObjectId, ref: 'Proof' },
  proofStatus: { type: String, enum: ['none', 'pending', 'approved', 'rejected'], default: 'none' },

  // Matching score for smart matching
  matchScore: { type: Number, default: 0 },

  // Tags for search
  tags: [{ type: String }],

  completedAt: { type: Date },
  verifiedAt:  { type: Date },
  verifiedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Virtual: funding percentage
requestSchema.virtual('fundingPercentage').get(function() {
  if (!this.fundsRequired) return 0;
  return Math.min(100, Math.round((this.fundsRaised / this.fundsRequired) * 100));
});

requestSchema.set('toJSON', { virtuals: true });
requestSchema.set('toObject', { virtuals: true });

// Index for smart matching queries
requestSchema.index({ category: 1, urgency: 1, status: 1 });
requestSchema.index({ 'location.city': 1, 'location.state': 1 });

module.exports = mongoose.model('Request', requestSchema);