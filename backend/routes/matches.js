const express = require('express');
const router = express.Router();
const { Match } = require('../models/index');
const Request = require('../models/Request');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// ── Smart Matching Algorithm ──────────────────────────────────
function calculateMatchScore(request, user) {
  let score = 0;
  const reasons = [];

  // 1. Urgency score (0-30)
  const urgencyScores = { critical: 30, high: 22, medium: 14, low: 6 };
  const urgencyScore = urgencyScores[request.urgency] || 0;
  score += urgencyScore;
  if (urgencyScore >= 22) reasons.push(`High urgency: ${request.urgency}`);

  // 2. Location match (0-25)
  const userCity  = user.location?.city?.toLowerCase();
  const userState = user.location?.state?.toLowerCase();
  const reqCity   = request.location?.city?.toLowerCase();
  const reqState  = request.location?.state?.toLowerCase();

  if (userCity && reqCity && userCity === reqCity) {
    score += 25;
    reasons.push('Same city');
  } else if (userState && reqState && userState === reqState) {
    score += 15;
    reasons.push('Same state');
  }

  // 3. Funding gap score (0-25)
  const fundingPct = request.fundsRaised / (request.fundsRequired || 1);
  if (fundingPct < 0.25) { score += 25; reasons.push('Critically underfunded'); }
  else if (fundingPct < 0.5) { score += 18; reasons.push('Needs funding'); }
  else if (fundingPct < 0.75) { score += 10; reasons.push('Partially funded'); }

  // 4. Category preference (0-10) — based on donor's past donations
  // (simplified: just check role match)
  if (user.role === 'donor') { score += 10; reasons.push('Active donor'); }
  if (user.role === 'volunteer') { score += 8; reasons.push('Available volunteer'); }

  // 5. Recency (0-10)
  const daysSince = (Date.now() - new Date(request.createdAt)) / (1000 * 60 * 60 * 24);
  if (daysSince < 3)  { score += 10; reasons.push('Just posted'); }
  else if (daysSince < 7)  { score += 6; }
  else if (daysSince < 14) { score += 3; }

  return { score: Math.min(100, score), reasons };
}

// GET /api/matches/for-me - get matched requests for logged-in user
router.get('/for-me', protect, async (req, res) => {
  try {
    const activeRequests = await Request.find({ status: { $in: ['active', 'funded'] } })
      .populate('ngo', 'name orgName avatar credibilityScore verified')
      .populate('proof')
      .limit(50);

    const scored = activeRequests.map(req => {
      const { score, reasons } = calculateMatchScore(req, req.user);
      return { request: req, score, reasons };
    }).sort((a, b) => b.score - a.score).slice(0, 12);

    // Save/update matches in DB
    await Promise.all(scored.map(({ request, score, reasons }) =>
      Match.findOneAndUpdate(
        { request: request._id, user: req.user._id },
        { score, reasons, userRole: req.user.role },
        { upsert: true, new: true }
      )
    ));

    res.json({ success: true, data: scored });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/matches/request/:requestId - matched users for a request
router.get('/request/:requestId', protect, async (req, res) => {
  try {
    const matches = await Match.find({ request: req.params.requestId })
      .populate('user', 'name avatar role location totalDonated')
      .sort({ score: -1 })
      .limit(20);
    res.json({ success: true, data: matches });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;