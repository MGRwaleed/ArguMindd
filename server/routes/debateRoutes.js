const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const Debate = require('../models/Debate');

const router = express.Router();

// GET /api/debates — fetch all debates for logged-in user
router.get('/', protect, async (req, res) => {
  try {
    const debates = await Debate.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(debates);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch debates' });
  }
});

// POST /api/debates — save a new debate result
router.post('/', protect, async (req, res) => {
  try {
    const { topic, opponent, score, outcome } = req.body;
    const debate = await Debate.create({
      user: req.user._id,
      topic,
      opponent,
      score,
      outcome,
    });
    res.status(201).json(debate);
  } catch (err) {
    res.status(500).json({ message: 'Failed to save debate' });
  }
});

module.exports = router;