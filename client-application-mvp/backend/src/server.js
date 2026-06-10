require('dotenv').config();

const cors = require('cors');
const express = require('express');
const applicationRoutes = require('./routes/applicationRoutes');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  process.env.USER_PANEL_URL,
  process.env.ADMIN_PANEL_URL,
  'http://localhost:5173',
  'http://localhost:5174'
].filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));

app.get('/', (_req, res) => {
  res.status(200).send('Tax MVP API Running');
});

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'tax-mvp-api'
  });
});

console.log('Health route registered');

app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API running on port ${PORT}`);
});
