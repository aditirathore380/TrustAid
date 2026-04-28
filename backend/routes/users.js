// ── routes/users.js ───────────────────────────────────────────
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// GET /api/users/ngos - list all NGOs (public)
router.get('/ngos', async (req, res) => {
  try {
    const ngos = await User.find({ role: 'ngo', isActive: true })
      .select('name orgName avatar credibilityScore verified location tasksCompleted')
      .sort({ credibilityScore: -1 });
    res.json({ success: true, data: ngos });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/users/:id - public profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -__v');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/users/profile - update own profile
router.put('/profile', protect, async (req, res) => {
  try {
    const allowed = ['name', 'phone', 'bio', 'location', 'avatar', 'orgName', 'donorType'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;