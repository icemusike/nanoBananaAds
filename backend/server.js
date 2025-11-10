import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import authRoute from './routes/auth.js';
import generateRoute from './routes/generate.js';
import adsRoute from './routes/ads.js';
import promptsRoute from './routes/prompts.js';
import anglesRoute from './routes/angles.js';
import userRoute from './routes/user.js';
import brandsRoute from './routes/brands.js';
import jvzooRoute from './routes/jvzoo.js';
import licenseRoute from './routes/license.js';
import adminAuthRoute from './routes/admin/auth.js';
import adminUsersRoute from './routes/admin/users.js';
import adminDashboardRoute from './routes/admin/dashboard.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5174',
  process.env.FRONTEND_URL, // Add your Vercel URL as environment variable
].filter(Boolean); // Remove undefined values

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-gemini-api-key', 'x-openai-api-key']
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', authRoute);
app.use('/api', generateRoute);
app.use('/api/ads', adsRoute);
app.use('/api/prompts', promptsRoute);
app.use('/api/angles', anglesRoute);
app.use('/api/user', userRoute);
app.use('/api/brands', brandsRoute);
app.use('/api/jvzoo', jvzooRoute);
app.use('/api/license', licenseRoute);

// Admin Routes
app.use('/api/admin/auth', adminAuthRoute);
app.use('/api/admin/users', adminUsersRoute);
app.use('/api/admin/dashboard', adminDashboardRoute);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'AdGenius AI API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

app.listen(PORT, () => {
  console.log(`🚀 AdGenius AI Backend running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
