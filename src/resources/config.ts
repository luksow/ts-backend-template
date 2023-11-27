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
    format: String,
    default: 'postgres://postgres:postgres@localhost:5432/postgres',
    env: 'DB_URL',
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
