const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  clickButton,
  applyReferralTimer,
  getReferralLeaderboard
} = require('../controllers/userController');

// Rotte utente
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/click', clickButton);
router.post('/referral', applyReferralTimer);
router.get('/leaderboard', getReferralLeaderboard);

module.exports = router;