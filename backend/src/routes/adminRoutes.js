// backend/src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Middleware per autenticazione admin (da implementare)
const authenticateAdmin = (req, res, next) => {
  // Implementa la logica di autenticazione admin
  next();
};

// Leaderboard
router.get('/leaderboard', authenticateAdmin, async (req, res) => {
  try {
    const topReferrers = await User.findAll({
      where: {
        referrals: {
          [Sequelize.Op.gt]: 0
        }
      },
      order: [['referrals', 'DESC']],
      limit: 10,
      attributes: ['email', 'referrals']
    });
    res.status(200).json({ leaderboard: topReferrers });
  } catch (error) {
    res.status(500).json({ message: 'Errore del server.' });
  }
});

module.exports = router;