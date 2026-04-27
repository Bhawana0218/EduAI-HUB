const express = require('express');
const cors = require('cors');



const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const recommendRoutes = require('./routes/recommendRoutes');
const universityRoutes = require('./routes/universityRoutes');
const authMiddleware = require('./middleware/authMiddleware');
const aiLimiter = require('./middleware/aiMiddleware');
const { login: adminLogin } = require('./controllers/authController');

const app = express();

const defaultCorsOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:9002',
  'http://127.0.0.1:9002'
];

const configuredOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = configuredOrigins.length ? configuredOrigins : defaultCorsOrigins;

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/admin/courses', courseRoutes);
app.use('/api/universities', universityRoutes);
app.use('/api/admin/universities', universityRoutes);
app.use('/api/recommend', aiLimiter, recommendRoutes);
app.use('/api/recommendations', aiLimiter, recommendRoutes);
app.use('/api/admin/recommend', aiLimiter, recommendRoutes);
app.use('/api/ai', aiLimiter, recommendRoutes);

app.get('/api/admin/dashboard', authMiddleware, (req, res) => {
  res.json({
    message: 'Welcome Admin',
    adminId: req.user.id
  });
});

// Backward-compatible alias for clients still calling /admin/login.
app.post('/admin/login', adminLogin);

app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found'
  });
});

app.use((err, req, res, next) => {
  if (err.message && err.message.startsWith('CORS blocked')) {
    return res.status(403).json({ message: err.message });
  }

  if (err.name === 'SyntaxError') {
    return res.status(400).json({ message: 'Invalid JSON payload' });
  }

  return res.status(err.status || 500).json({
    message: err.message || 'Internal server error'
  });
});

module.exports = app;
