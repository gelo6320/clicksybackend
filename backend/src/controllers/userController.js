const User = require('../models/userModel');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  // Registrazione utente
  registerUser: async (req, res) => {
    try {
      const { email, password, googleId, referredBy } = req.body;
      // Genera un referralCode unico
      const referralCode = uuidv4();

      // Controlla se l'utente esiste già
      let existingUser = null;
      if (email) {
        existingUser = await User.findOne({ where: { email } });
      } else if (googleId) {
        existingUser = await User.findOne({ where: { googleId } });
      }

      if (existingUser) {
        return res.status(400).json({ message: 'Utente già registrato.' });
      }

      // Crea l'utente
      const newUser = await User.create({
        email,
        password,  // in un caso reale andrebbe criptata
        googleId,
        referralCode,
        referredBy
      });

      res.status(201).json({ 
        message: 'Utente registrato con successo.',
        user: {
          id: newUser.id,
          email: newUser.email,
          referralCode: newUser.referralCode
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Errore interno.' });
    }
  },

  // Login utente (semplificato, da adattare se usi Google OAuth su frontend)
  loginUser: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(404).json({ message: 'Utente non trovato.' });
      }

      // Check password in chiaro (in un caso reale dev’essere hashata)
      if (user.password !== password) {
        return res.status(401).json({ message: 'Credenziali non valide.' });
      }

      return res.json({
        message: 'Login effettuato.',
        user: {
          id: user.id,
          email: user.email,
          referralCode: user.referralCode,
          nextClickTime: user.nextClickTime
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Errore interno.' });
    }
  },

  // Funzione per cliccare il pulsante "ritira 100 €"
  clickButton: async (req, res) => {
    try {
      const { userId } = req.body;
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: 'Utente non trovato.' });
      }

      // Verifica se l'utente può cliccare
      const now = new Date();
      if (user.nextClickTime && now < user.nextClickTime) {
        return res.status(400).json({
          message: 'Non puoi ancora cliccare, attendi il timer.',
          nextClickTime: user.nextClickTime
        });
      }

      // Calcola la prossima data di click (24 ore dopo di default)
      const nextClickDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      user.nextClickTime = nextClickDate;
      await user.save();

      return res.json({
        message: 'Pulsante cliccato con successo!',
        nextClickTime: user.nextClickTime
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Errore interno.' });
    }
  },

  // Aggiusta timer con referral (quando arriva da un ref link)
  applyReferralTimer: async (req, res) => {
    try {
      // La logica di ridurre a 10 ore al primo click dell’invitato
      // e ridurre di 6 ore il timer dell’invitante.
      const { userId, refCode } = req.body;
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: 'Utente non trovato.' });
      }

      // Se c'è un referredBy, e corrisponde a un utente esistente
      if (refCode) {
        const refOwner = await User.findOne({ where: { referralCode: refCode } });
        if (refOwner && user.referredBy === refCode) {
          // Imposta nextClickTime a 10 ore dalla registrazione se non è mai stato impostato
          const now = new Date();
          if (!user.nextClickTime) {
            const nextClickDate = new Date(now.getTime() + 10 * 60 * 60 * 1000);
            user.nextClickTime = nextClickDate;
          }

          // Riduce il timer dell'invitante di 6 ore SOLO DOPO che l’invitato clicca il pulsante almeno una volta?
          // Dipende dalla logica, potresti controllare se l’invitato ha cliccato. 
          // Qui ipotizziamo che quando l’invitato effettua il primo click, facciamo la riduzione all’invitante:
          const ownerNextClick = refOwner.nextClickTime ? refOwner.nextClickTime : new Date();
          const newOwnerNextClick = new Date(ownerNextClick.getTime() - 6 * 60 * 60 * 1000);
          refOwner.nextClickTime = newOwnerNextClick > now ? newOwnerNextClick : now;
          refOwner.referralCount = refOwner.referralCount + 1; // aggiorna classifica
          await refOwner.save();
        }
      }

      await user.save();

      return res.json({ 
        message: 'Timer referral applicato con successo!',
        user
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Errore interno.' });
    }
  },

  // Recupera classifica referral
  getReferralLeaderboard: async (req, res) => {
    try {
      const topReferrals = await User.findAll({
        order: [['referralCount', 'DESC']],
        limit: 10
      });

      res.json(topReferrals);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Errore interno.' });
    }
  }
};
