const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const reservationRoutes = require('./src/routes/reservationRoutes');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const frontendDistPath = path.join(__dirname, 'frontend-app', 'dist', 'frontend-app', 'browser');

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ ok: true, message: 'API de reservas de pádel activa' });
});

app.use('/api/auth', authRoutes);
app.use('/api/reservations', reservationRoutes);

if (frontendDistPath) {
  app.use(express.static(frontendDistPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }

    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Servidor ejecutándose en http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('Error al iniciar la aplicación:', error.message);
    process.exit(1);
  });
