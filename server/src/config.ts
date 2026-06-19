export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  database: {
    url:
      process.env.DATABASE_URL ||
      'postgresql://campuscollar:campuscollar_dev@localhost:5432/campuscollar',
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  stellar: {
    rpcUrl: process.env.STELLAR_RPC_URL || 'http://localhost:8000/soroban/rpc',
    networkPassphrase:
      process.env.STELLAR_NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'change-me-in-production',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },

  upload: {
    dir: process.env.UPLOAD_DIR || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10),
  },
};
