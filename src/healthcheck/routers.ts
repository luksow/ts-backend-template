import { Authenticator } from '../auth/authenticator';
import { ErrorResponse } from '../utils/http/middleware';
import { baseApi, c, s } from '../utils/http/ts-rest';
import { DbHealthCheck, HealthCheck } from './domain';
import { HealthCheckService } from './services';

export const healthCheckApi = c.router(
  {
    getHealthCheck: {
      method: 'GET',
      path: '/healthcheck/http',
      responses: {
        200: HealthCheck,
        401: ErrorResponse,
      },
    },
    dbHealthCheck: {
      method: 'GET',
      path: '/healthcheck/db',
      responses: {
        200: DbHealthCheck,
      },
    },
  },
  { ...baseApi, strictStatusCodes: true },
);

export const makeHealthCheckRouter = (authenticator: Authenticator, healthCheckService: HealthCheckService) => {
  return s.router(healthCheckApi, {
    getHealthCheck: async (req) => {
      const authResult = await authenticator.authenticateOpt(req);
      if (!authResult)
        return {
          status: 200,
          body: healthCheckService.getHealthCheck(authResult),
        };
      else if (authResult.status === 'Authenticated')
        return {
          status: 200,
          body: healthCheckService.getHealthCheck(authResult.authContext),
        };
      else
        return {
          status: 401,
          body: { message: `Could not authenticate: ${authResult.status}` },
        };
    },
    dbHealthCheck: async () => {
      return {
        status: 200,
        body: await healthCheckService.db(),
      };
    },
  });
};
