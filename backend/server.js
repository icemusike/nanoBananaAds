import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import generateRoute from './routes/generate.js';
import adsRoute from './routes/ads.js';
import promptsRoute from './routes/prompts.js';
import anglesRoute from './routes/angles.js';
import userRoute from './routes/user.js';
import brandsRoute from './routes/brands.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api', generateRoute);
app.use('/api/ads', adsRoute);
app.use('/api/prompts', promptsRoute);
app.use('/api/angles', anglesRoute);
app.use('/api/user', userRoute);
app.use('/api/brands', brandsRoute);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Nano Banana Ad Creator API is running',
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
  console.log(`🚀 Nano Banana Backend running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
