// ── routes/donations.js ───────────────────────────────────────
const express = require('express');
const router = express.Router();
const { Donation } = require('../models/index');
const Request = require('../models/Request');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// POST /api/donations - donor makes a donation (mock payment)
router.post('/', protect, authorize('donor', 'admin'), async (req, res) => {
  try {
    const { requestId, amount, paymentMethod, message, anonymous } = req.body;
    if (!requestId || !amount || amount < 1)
      return res.status(400).json({ success: false, message: 'requestId and amount required' });

    const request = await Request.findById(requestId);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    if (request.status === 'completed')
      return res.status(400).json({ success: false, message: 'Request already completed' });

    // Mock payment — generate transaction ID
    const transactionId = `TXN-${uuidv4().substring(0, 12).toUpperCase()}`;

    const donation = await Donation.create({
      donor: req.user._id,
      request: requestId,
      ngo: request.ngo,
      amount: parseFloat(amount),
      paymentMethod: paymentMethod || 'card',
      message: message || '',
      anonymous: anonymous || false,
      transactionId,
      status: 'completed'
    });

    // Update request funds raised
    request.fundsRaised += parseFloat(amount);
    if (request.fundsRaised >= request.fundsRequired && request.status === 'active') {
      request.status = 'funded';
    }
    await request.save();

    // Update donor total donated
    await User.findByIdAndUpdate(req.user._id, { $inc: { totalDonated: parseFloat(amount) } });

    const populated = await donation.populate([
      { path: 'donor', select: 'name avatar donorType' },
      { path: 'request', select: 'title category' },
      { path: 'ngo', select: 'name orgName' }
    ]);

    res.status(201).json({ success: true, data: populated, transactionId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/donations/my - donor's own donations
router.get('/my', protect, async (req, res) => {
  try {
    const donations = await Donation.find({ donor: req.user._id })
      .populate('request', 'title category status proofStatus proof')
      .populate('ngo', 'name orgName avatar')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: donations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/donations/request/:requestId - donations for a request
router.get('/request/:requestId', protect, async (req, res) => {
  try {
    const donations = await Donation.find({ request: req.params.requestId, anonymous: false })
      .populate('donor', 'name avatar donorType')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: donations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/donations/stats - platform-wide stats
router.get('/stats', async (req, res) => {
  try {
    const [totalDonations, totalAmount, totalDonors] = await Promise.all([
      Donation.countDocuments({ status: 'completed' }),
      Donation.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
      Donation.distinct('donor').then(d => d.length)
    ]);
    res.json({ success: true, data: { totalDonations, totalAmount: totalAmount[0]?.total || 0, totalDonors } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;