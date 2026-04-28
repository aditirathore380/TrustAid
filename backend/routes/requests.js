const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// GET /api/requests - list all (with filters)
router.get('/', async (req, res) => {
  try {
    const { category, urgency, status, city, state, search, sort, page = 1, limit = 12 } = req.query;
    const query = {};
    if (category)      query.category = category;
    if (urgency)       query.urgency  = urgency;
    if (status)        query.status   = status;
    else               query.status   = { $in: ['active', 'funded', 'in_progress'] };
    if (city)          query['location.city']  = new RegExp(city, 'i');
    if (state)         query['location.state'] = new RegExp(state, 'i');
    if (search)        query.$or = [
      { title: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') },
      { tags: new RegExp(search, 'i') }
    ];

    const sortOptions = {
      newest: { createdAt: -1 },
      urgency: { urgency: -1, createdAt: -1 },
      funding: { fundingPercentage: -1 },
      amount:  { fundsRequired: -1 }
    };
    const sortBy = sortOptions[sort] || { createdAt: -1 };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [requests, total] = await Promise.all([
      Request.find(query).populate('ngo', 'name orgName avatar credibilityScore verified location').populate('proof').sort(sortBy).skip(skip).limit(parseInt(limit)),
      Request.countDocuments(query)
    ]);

    res.json({ success: true, data: requests, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/requests/completed - completed with proof
router.get('/completed', async (req, res) => {
  try {
    const requests = await Request.find({ status: 'completed', proofStatus: 'approved' })
      .populate('ngo', 'name orgName avatar credibilityScore verified')
      .populate('proof')
      .sort({ completedAt: -1 })
      .limit(20);
    res.json({ success: true, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/requests/:id
router.get('/:id', async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('ngo', 'name orgName avatar credibilityScore verified location phone')
      .populate('proof');
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    res.json({ success: true, data: request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/requests - NGO creates request
router.post('/', protect, authorize('ngo', 'admin'), upload.array('beforeImages', 5), async (req, res) => {
  try {
    const { title, description, category, urgency, fundsRequired, targetDate, beneficiaries, tags, location } = req.body;
    const beforeImages = (req.files || []).map(f => `/uploads/images/${f.filename}`);
    const parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;

    const request = await Request.create({
      ngo: req.user._id, title, description, category, urgency,
      fundsRequired: parseFloat(fundsRequired),
      targetDate, beneficiaries: parseInt(beneficiaries) || 0,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
      location: parsedLocation,
      beforeImages
    });

    const populated = await request.populate('ngo', 'name orgName avatar');
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/requests/:id - NGO updates own request
router.put('/:id', protect, authorize('ngo', 'admin'), async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Not found' });
    if (request.ngo.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized' });

    Object.assign(request, req.body);
    await request.save();
    res.json({ success: true, data: request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/requests/ngo/my - NGO's own requests
router.get('/ngo/my', protect, authorize('ngo', 'admin'), async (req, res) => {
  try {
    const requests = await Request.find({ ngo: req.user._id })
      .populate('proof')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;