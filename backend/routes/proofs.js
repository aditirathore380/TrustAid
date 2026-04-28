const express = require('express');
const router = express.Router();
const { Proof } = require('../models/index');
const Request = require('../models/Request');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// POST /api/proofs/:requestId - NGO uploads proof
router.post('/:requestId', protect, authorize('ngo', 'admin'),
  upload.fields([
    { name: 'videos', maxCount: 3 },
    { name: 'images', maxCount: 10 }
  ]),
  async (req, res) => {
    try {
      const { title, description, beneficiariesServed, fundsUtilised } = req.body;
      const request = await Request.findById(req.params.requestId);
      if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
      if (request.ngo.toString() !== req.user._id.toString() && req.user.role !== 'admin')
        return res.status(403).json({ success: false, message: 'Not authorized' });

      const videos = (req.files?.videos || []).map(f => ({
        filename: f.filename,
        originalName: f.originalname,
        path: `/uploads/videos/${f.filename}`,
        size: f.size
      }));
      const images = (req.files?.images || []).map(f => ({
        filename: f.filename,
        originalName: f.originalname,
        path: `/uploads/images/${f.filename}`,
        size: f.size
      }));

      const proof = await Proof.create({
        request: request._id,
        ngo: req.user._id,
        title, description, videos, images,
        beneficiariesServed: parseInt(beneficiariesServed) || 0,
        fundsUtilised: parseFloat(fundsUtilised) || 0
      });

      // Update request
      request.proof = proof._id;
      request.proofStatus = 'pending';
      request.status = 'in_progress';
      await request.save();

      res.status(201).json({ success: true, data: proof, message: 'Proof uploaded. Awaiting admin review.' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// GET /api/proofs/:requestId - get proof for a request
router.get('/:requestId', async (req, res) => {
  try {
    const proof = await Proof.findOne({ request: req.params.requestId })
      .populate('ngo', 'name orgName avatar');
    if (!proof) return res.status(404).json({ success: false, message: 'No proof uploaded yet' });
    res.json({ success: true, data: proof });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/proofs/:id/review - admin approves/rejects proof
router.patch('/:id/review', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, adminNote } = req.body; // 'approved' | 'rejected'
    if (!['approved', 'rejected'].includes(status))
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected' });

    const proof = await Proof.findByIdAndUpdate(
      req.params.id,
      { status, adminNote: adminNote || '', reviewedBy: req.user._id, reviewedAt: new Date() },
      { new: true }
    );
    if (!proof) return res.status(404).json({ success: false, message: 'Proof not found' });

    // Update request status
    const request = await Request.findById(proof.request);
    if (request) {
      request.proofStatus = status;
      if (status === 'approved') {
        request.status = 'completed';
        request.completedAt = new Date();
        request.verifiedAt = new Date();
        request.verifiedBy = req.user._id;
        // Increase NGO credibility
        await User.findByIdAndUpdate(proof.ngo, {
          $inc: { credibilityScore: 5, tasksCompleted: 1 }
        });
      } else {
        request.status = 'in_progress'; // back to in_progress
      }
      await request.save();
    }

    res.json({ success: true, data: proof, message: `Proof ${status}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/proofs - all approved proofs (public showcase)
router.get('/', async (req, res) => {
  try {
    const proofs = await Proof.find({ status: 'approved' })
      .populate('ngo', 'name orgName avatar')
      .populate('request', 'title category location')
      .sort({ reviewedAt: -1 })
      .limit(20);
    res.json({ success: true, data: proofs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;