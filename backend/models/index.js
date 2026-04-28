const mongoose = require('mongoose');

// ── Donation Model ────────────────────────────────────────────
const donationSchema = new mongoose.Schema({
  donor:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  request:     { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true },
  ngo:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount:      { type: Number, required: true, min: 1 },
  currency:    { type: String, default: 'INR' },
  status:      { type: String, enum: ['pending', 'completed', 'refunded'], default: 'completed' },
  // Mock payment
  transactionId: { type: String, unique: true },
  paymentMethod: { type: String, enum: ['card', 'upi', 'netbanking', 'wallet'], default: 'card' },
  message:    { type: String, default: '' },
  anonymous:  { type: Boolean, default: false },
  // Impact tracking
  impactReport: { type: String, default: '' },
}, { timestamps: true });

// ── Proof Model ───────────────────────────────────────────────
const proofSchema = new mongoose.Schema({
  request:     { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true },
  ngo:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:       { type: String, required: true },
  description: { type: String, required: true },
  // After-state media
  videos: [{
    filename:    { type: String },
    originalName:{ type: String },
    path:        { type: String },
    size:        { type: Number },
    duration:    { type: String },
    uploadedAt:  { type: Date, default: Date.now }
  }],
  images: [{
    filename:    { type: String },
    originalName:{ type: String },
    path:        { type: String },
    uploadedAt:  { type: Date, default: Date.now }
  }],
  beneficiariesServed: { type: Number, default: 0 },
  fundsUtilised:       { type: Number, default: 0 },
  status:   { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminNote:{ type: String, default: '' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },
  timestamp:  { type: Date, default: Date.now },
}, { timestamps: true });

// ── Match Model ───────────────────────────────────────────────
const matchSchema = new mongoose.Schema({
  request:  { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true },
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userRole: { type: String, enum: ['donor', 'volunteer'] },
  score:    { type: Number, default: 0 },   // 0-100 match score
  reasons:  [{ type: String }],              // Why matched
  status:   { type: String, enum: ['suggested', 'viewed', 'accepted', 'declined'], default: 'suggested' },
  notified: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = {
  Donation: mongoose.model('Donation', donationSchema),
  Proof:    mongoose.model('Proof', proofSchema),
  Match:    mongoose.model('Match', matchSchema),
};