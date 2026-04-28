const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true },
  password:     { type: String, required: true, minlength: 6, select: false },
  role:         { type: String, enum: ['ngo', 'donor', 'volunteer', 'admin'], required: true },
  avatar:       { type: String, default: '' },
  // NGO-specific
  orgName:      { type: String, default: '' },
  orgRegNumber: { type: String, default: '' },
  verified:     { type: Boolean, default: false },
  // Donor-specific
  donorType:    { type: String, enum: ['celebrity', 'politician', 'public', ''], default: '' },
  // Location
  location: {
    city:    { type: String, default: '' },
    state:   { type: String, default: '' },
    country: { type: String, default: 'India' },
    coords:  { lat: Number, lng: Number }
  },
  // Stats
  totalDonated:    { type: Number, default: 0 },
  tasksCompleted:  { type: Number, default: 0 },
  credibilityScore:{ type: Number, default: 50, min: 0, max: 100 },
  phone:  { type: String, default: '' },
  bio:    { type: String, default: '' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);