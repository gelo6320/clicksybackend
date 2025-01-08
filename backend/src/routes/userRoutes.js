// backend/src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Registrazione
router.post('/register', async (req, res) => {
  const { email, password, referredBy } = req.body;
  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email già registrata.' });
    }
    const newUser = await User.create({ email, password, referredBy });
    res.status(201).json({ message: 'Registrazione riuscita.', user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Errore del server.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email, password } }); // Nota: Usa hash per password in produzione
    if (!user) {
      return res.status(400).json({ message: 'Credenziali non valide.' });
    }
    res.status(200).json({ message: 'Login riuscito.', user });
  } catch (error) {
    res.status(500).json({ message: 'Errore del server.' });
  }
});

// Rotta per applicare referral
router.post('/referral', async (req, res) => {
  const { userId, refCode } = req.body;
  try {
    const inviter = await User.findOne({ where: { referralCode: refCode } });
    if (!inviter) {
      return res.status(400).json({ message: 'Referral code non valido.' });
    }

    const invitee = await User.findByPk(userId);
    if (!invitee) {
      return res.status(400).json({ message: 'Utente non trovato.' });
    }

    if (invitee.referredBy) {
      return res.status(400).json({ message: 'Referral già applicato.' });
    }

    // Applica il referral
    invitee.referredBy = refCode;
    await invitee.save();

    // Incrementa il contatore di referrals dell'invitante
    inviter.referrals += 1;
    await inviter.save();

    res.status(200).json({ message: 'Referral applicato correttamente.' });
  } catch (error) {
    res.status(500).json({ message: 'Errore del server.' });
  }
});

// backend/src/routes/userRoutes.js
router.post('/click', async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(400).json({ message: 'Utente non trovato.' });
    }

    let nextClickTime = new Date();
    let discountHours = 0;

    if (user.referredBy && !user.hasClickedReferral) {
      // Invitato tramite referral
      discountHours = 10;
      user.hasClickedReferral = true;
      await user.save();

      // Togli 6 ore al timer dell'invitante
      const inviter = await User.findOne({ where: { referralCode: user.referredBy } });
      if (inviter) {
        // Supponiamo che l'invitante abbia un campo timer da aggiornare
        // Potresti dover aggiungere un campo timer al modello User
        // Per semplicità, supponiamo che il timer sia gestito nel frontend
        // Qui, potresti inviare un messaggio per aggiornare il frontend dell'invitante
      }
    }

    // Imposta il prossimo click
    nextClickTime.setHours(nextClickTime.getHours() + 24 - discountHours);

    res.status(200).json({ message: 'Click registrato.', nextClickTime });
  } catch (error) {
    res.status(500).json({ message: 'Errore del server.' });
  }
});

module.exports = router;