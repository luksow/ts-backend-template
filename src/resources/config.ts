import convict from 'convict';

const config = convict({
  app: {
    name: {
      format: String,
      default: 'ts-sample-backend',
    },
    environment: {
      format: ['production', 'development', 'test'],
      default: 'development',
      env: 'NODE_ENV',
    },
    version: {
      format: String,
      default: 'test',
      env: 'APP_VERSION',
    },
    apiVersion: {
      format: String,
      default: 'v1',
    },
  },
  logging: {
    requestResponseLogLevel: {
      format: ['error', 'warn', 'info', 'verbose', 'debug', 'silly'],
      default: 'info',
      env: 'REQUEST_RESPONSE_LOG_LEVEL',
    },
  },
  db: {
    host: {
      format: String,
      default: 'localhost',
      env: 'DB_HOST',
    },
    port: {
      format: Number,
      default: 5432,
      env: 'DB_PORT',
    },
    name: {
      format: String,
      default: 'postgres',
      env: 'DB_NAME',
    },
    user: {
      format: String,
      default: 'postgres',
      env: 'DB_USER',
    },
    password: {
      format: String,
      default: 'postgres',
      env: 'DB_PASSWORD',
    },
  },
  firebase: {
    credentials: {
      format: String,
      default: '',
      env: 'FIREBASE_CREDENTIALS',
    },
  },
});

export default config;
