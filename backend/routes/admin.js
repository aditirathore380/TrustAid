const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Request = require('../models/Request');
const { Donation, Proof } = require('../models/index');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require admin role
router.use(protect, authorize('admin'));

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const [users, requests, donations, proofsPending, totalRaised] = await Promise.all([
      User.countDocuments(),
      Request.countDocuments(),
      Donation.countDocuments({ status: 'completed' }),
      Proof.countDocuments({ status: 'pending' }),
      Donation.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }])
    ]);
    const completedRequests = await Request.countDocuments({ status: 'completed' });
    res.json({
      success: true, data: {
        users, requests, donations, proofsPending,
        completedRequests, totalRaised: totalRaised[0]?.total || 0
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/proofs/pending
router.get('/proofs/pending', async (req, res) => {
  try {
    const proofs = await Proof.find({ status: 'pending' })
      .populate('ngo', 'name orgName credibilityScore')
      .populate('request', 'title category fundsRequired fundsRaised location')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: proofs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/admin/users/:id/verify - verify an NGO
router.patch('/users/:id/verify', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { verified: true }, { new: true });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/admin/requests/:id/status
router.patch('/requests/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const request = await Request.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json({ success: true, data: request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;