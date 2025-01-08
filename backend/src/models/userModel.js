// backend/src/models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(),
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  referralCode: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    defaultValue: () => uuidv4().split('-')[0] // Genera un codice breve
  },
  referredBy: {
    type: DataTypes.STRING,
    allowNull: true
  },
  referrals: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  // backend/src/models/User.js
// Aggiungi un campo per tracciare se l'utente ha già cliccato tramite referral
hasClickedReferral: {
  type: DataTypes.BOOLEAN,
  defaultValue: false
}
  // Altri campi...
}, {
  tableName: 'users',
  timestamps: true
});

module.exports = User;