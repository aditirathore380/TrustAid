// ── backend/seeder.js ─────────────────────────────────────────
// Run: node seeder.js
// Seeds the database with demo users, requests, and donations.

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Request = require('./models/Request');
const { Donation } = require('./models/index');

async function seed() {
  console.log('🌱 Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected');

  // Clear existing data
  await Promise.all([User.deleteMany(), Request.deleteMany(), Donation.deleteMany()]);
  console.log('🗑️  Cleared existing data');

  const hash = (p) => bcrypt.hash(p, 12);

  // ── Users ──────────────────────────────────────────────────
  const [admin, ngo1, ngo2, donor1, donor2] = await User.insertMany([
    {
      name: 'Admin User', email: 'admin@trustaid.com',
      password: await hash('admin123'), role: 'admin',
      verified: true, credibilityScore: 100,
      location: { city: 'Ujjain', state: 'Madhya Pradesh', country: 'India' }
    },
    {
      name: 'Ananya Sharma', email: 'ngo1@trustaid.com',
      password: await hash('ngo12345'), role: 'ngo',
      orgName: 'Seva Foundation', orgRegNumber: 'NGO/MH/2019/001',
      verified: true, credibilityScore: 88, tasksCompleted: 14,
      phone: '+91 98765 43210',
      location: { city: 'Ujjain', state: 'Madhya Pradesh', country: 'India' }
    },
    {
      name: 'Rajesh Kumar', email: 'ngo2@trustaid.com',
      password: await hash('ngo12345'), role: 'ngo',
      orgName: 'Jan Kalyan Trust', orgRegNumber: 'NGO/DL/2020/042',
      verified: true, credibilityScore: 75, tasksCompleted: 8,
      phone: '+91 87654 32109',
      location: { city: 'Ujjain', state: 'Madhya Pradesh', country: 'India' }
    },
    {
      name: 'Priya Mehta', email: 'donor1@trustaid.com',
      password: await hash('donor123'), role: 'donor',
      donorType: 'celebrity', totalDonated: 250000,
      location: { city: 'Ujjain', state: 'Madhya Pradesh', country: 'India' }
    },
    {
      name: 'Vikram Singh', email: 'donor2@trustaid.com',
      password: await hash('donor123'), role: 'donor',
      donorType: 'public', totalDonated: 15000,
      location: { city: 'Indore', state: 'Madhya Pradesh', country: 'India' }
    },
  ]);
  console.log('✅ Users seeded: admin, 2 NGOs, 2 donors');

  // ── Requests ───────────────────────────────────────────────
  const [req1, req2, req3, req4] = await Request.insertMany([
    {
      ngo: ngo1._id,
      title: 'Emergency food relief for 500 flood-affected families in Assam',
      description: 'Devastating floods have displaced thousands in Assam. We need to provide dry ration kits (rice, dal, oil, salt) to 500 families for 15 days. Each kit costs ₹800.',
      category: 'food', urgency: 'critical',
      location: { address: 'Relief Camp, Kaziranga Road', city: 'Jorhat', state: 'Assam', country: 'India' },
      fundsRequired: 400000, fundsRaised: 280000,
      beneficiaries: 500, status: 'funded',
      tags: ['flood', 'food', 'emergency', 'assam'],
      targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    {
      ngo: ngo1._id,
      title: 'Free medical camp for tribal communities in Odisha',
      description: 'Remote tribal villages in Odisha lack access to basic healthcare. We are organizing a 3-day medical camp with doctors, free medicines, and diagnostics for 1,000 people.',
      category: 'medical', urgency: 'high',
      location: { address: 'Koraput District Villages', city: 'Koraput', state: 'Odisha', country: 'India' },
      fundsRequired: 180000, fundsRaised: 45000,
      beneficiaries: 1000, status: 'active',
      tags: ['medical', 'tribal', 'healthcare', 'odisha'],
      targetDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    },
    {
      ngo: ngo2._id,
      title: 'Digital literacy program for 200 rural school children in Bihar',
      description: 'Children in rural Bihar have never used a computer. We need funds to set up a computer lab with 20 systems, internet connectivity, and a 6-month training program.',
      category: 'education', urgency: 'medium',
      location: { address: 'Govt Primary School, Darbhanga', city: 'Darbhanga', state: 'Bihar', country: 'India' },
      fundsRequired: 350000, fundsRaised: 350000,
      beneficiaries: 200, status: 'completed',
      proofStatus: 'approved',
      completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      verifiedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      verifiedBy: admin._id,
      tags: ['education', 'digital', 'children', 'bihar'],
    },
    {
      ngo: ngo2._id,
      title: 'Clean drinking water installation for 3 villages in Rajasthan',
      description: 'Three villages in Rajasthan have no access to clean water. Women walk 8km daily. We need funds for RO purification units, pipelines, and storage tanks for 1,500 villagers.',
      category: 'water', urgency: 'high',
      location: { address: 'Barmer District, Remote Villages', city: 'Barmer', state: 'Rajasthan', country: 'India' },
      fundsRequired: 600000, fundsRaised: 120000,
      beneficiaries: 1500, status: 'active',
      tags: ['water', 'villages', 'infrastructure', 'rajasthan'],
      targetDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    },
  ]);
  console.log('✅ Requests seeded: 4 requests (1 completed)');

  // ── Donations ──────────────────────────────────────────────
  const { v4: uuidv4 } = require('uuid');
  await Donation.insertMany([
    { donor: donor1._id, request: req1._id, ngo: ngo1._id, amount: 150000, paymentMethod: 'card', transactionId: `TXN-${uuidv4().substring(0,12).toUpperCase()}`, status: 'completed', message: 'Glad to support flood victims 🙏' },
    { donor: donor2._id, request: req1._id, ngo: ngo1._id, amount: 25000, paymentMethod: 'upi', transactionId: `TXN-${uuidv4().substring(0,12).toUpperCase()}`, status: 'completed', message: 'Stay strong Assam' },
    { donor: donor1._id, request: req3._id, ngo: ngo2._id, amount: 200000, paymentMethod: 'netbanking', transactionId: `TXN-${uuidv4().substring(0,12).toUpperCase()}`, status: 'completed' },
    { donor: donor2._id, request: req4._id, ngo: ngo2._id, amount: 10000, paymentMethod: 'upi', transactionId: `TXN-${uuidv4().substring(0,12).toUpperCase()}`, status: 'completed', message: 'Water is life!' },
  ]);
  console.log('✅ Donations seeded: 4 donations');

  console.log('\n══════════════════════════════════════════');
  console.log('  🎉 Database seeded successfully!');
  console.log('══════════════════════════════════════════');
  console.log('  Login credentials:');
  console.log('  Admin:  admin@trustaid.com  / admin123');
  console.log('  NGO 1:  ngo1@trustaid.com   / ngo12345');
  console.log('  NGO 2:  ngo2@trustaid.com   / ngo12345');
  console.log('  Donor:  donor1@trustaid.com / donor123');
  console.log('══════════════════════════════════════════\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});