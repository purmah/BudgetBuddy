require('dotenv').config();

// Parse DATABASE_URL if provided (for Render deployment)
const getDatabaseConfig = () => {
  if (process.env.DATABASE_URL) {
    // Parse postgres://user:pass@host:port/dbname
    const url = new URL(process.env.DATABASE_URL);
    return {
      host: url.hostname,
      port: url.port || 5432,
      name: url.pathname.slice(1), // Remove leading /
      username: url.username,
      password: url.password
    };
  }
  
  // Fallback to individual env vars
  return {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || 'budgetbuddy_db',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'password'
  };
};

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5100,
  database: getDatabaseConfig(),
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_secret_key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASS
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100
  }
};