const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  googleId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true
  },
  referralCode: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  referredBy: {
    type: DataTypes.STRING,
    allowNull: true
  },
  nextClickTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // se vuoi tracciare quanti referral ha portato
  referralCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'users'
});

module.exports = User;
