import { RouterOptions } from '@ts-rest/core';
import { createExpressEndpoints } from '@ts-rest/express';
import { generateOpenApi } from '@ts-rest/open-api';
import { AsyncLocalStorage } from 'async_hooks';
import bodyParser from 'body-parser';
import express from 'express';
import { DatabasePool, createPool } from 'slonik';
import * as swaggerUi from 'swagger-ui-express';
import winston from 'winston';

import { makeAuthenticator } from '../auth/authenticator';
import { healthCheckApi, makeHealthCheckRouter } from '../healthcheck/routers';
import { makeHealthCheckService } from '../healthcheck/services';
import config from '../resources/config';
import { makeRoadmapRouter, roadmapApi } from '../roadmap/routers';
import { makeRoadmapService } from '../roadmap/services';
import { TracingContext, makeErrorHandler, makeRequestResponseLogger, makeTracingMiddleware } from '../utils/http/middleware';
import { c, s } from '../utils/http/ts-rest';

async function main() {
  const asyncLocalStorage = new AsyncLocalStorage<TracingContext>();
  const pool: DatabasePool = await createPool(config.get('db'));
  const logger: winston.Logger = winston.createLogger({
    format: winston.format.combine(
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.timestamp(),
      winston.format.printf(({ level, message, ...meta }) => {
        const object = { level, message, ...meta };
        const store = asyncLocalStorage.getStore();
        if (store) {
          return JSON.stringify({ ...object, ...store });
        }
        return JSON.stringify(object);
      }),
    ),
    transports: [new winston.transports.Console()],
  });

  const app = express();
  app.use(makeTracingMiddleware(asyncLocalStorage));
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  const apiVersion = config.get('app.apiVersion');
  const apiOptions: RouterOptions = {
    pathPrefix: `/${apiVersion}`,
  };

  const firebaseConfig = config.get('firebase');
  const authenticator = makeAuthenticator(firebaseConfig, asyncLocalStorage);

  const healthCheckService = makeHealthCheckService(pool, config.get('app'));
  const healthCheckRouter = makeHealthCheckRouter(authenticator, healthCheckService);

  const roadmapService = makeRoadmapService(logger);
  const roadmapRouter = makeRoadmapRouter(roadmapService, authenticator);

  const api = c.router(
    {
      health: healthCheckApi,
      roadmap: roadmapApi,
    },
    {
      ...apiOptions,
    },
  );

  const router = s.router(api, {
    health: healthCheckRouter,
    roadmap: roadmapRouter,
  });

  const openApiDocument = generateOpenApi(api, {
    info: {
      title: 'ts-sample-backend',
      version: config.get('app.version'),
    },
  });

  createExpressEndpoints(api, router, app, {
    globalMiddleware: [makeRequestResponseLogger(config.get('logging.requestResponseLogLevel'), logger)],
  });
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));
  app.use(makeErrorHandler(logger));
  logger.info('Starting server...');
  app.listen(3000);
}

void main();
