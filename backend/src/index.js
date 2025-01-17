require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Rotte
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Aggiungi una route per "/"
app.get('/', (req, res) => {
  res.send('Il backend è attivo e funzionante!');
});

// Sincronizza i modelli con il DB
sequelize.sync({ alter: true })
  .then(() => {
    console.log('Database sincronizzato correttamente.');
  })
  .catch((err) => {
    console.error('Errore nella sincronizzazione del DB:', err);
  });

// Porta di ascolto
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Backend in ascolto su porta ${PORT}`);
});
