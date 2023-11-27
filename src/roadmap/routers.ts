import { z } from 'zod';
import { Authenticator } from '../auth/authenticator';
import { ErrorResponse } from '../utils/http/middleware';
import { baseAuthenticatedApi, c, s } from '../utils/http/ts-rest';
import { Roadmap } from './domain';
import { RoadmapService } from './services';

export const roadmapApi = c.router(
  {
    listRoadmaps: {
      method: 'GET',
      path: '/roadmaps',
      responses: {
        201: z.array(Roadmap),
        401: ErrorResponse,
      },
    },
  },
  baseAuthenticatedApi,
);

export const makeRoadmapRouter = (roadmapService: RoadmapService, authenticator: Authenticator) => {
  return s.router(roadmapApi, {
    listRoadmaps: async (req) => {
      const authContext = await authenticator.authenticateOrThrow(req);
      return {
        status: 200,
        body: await roadmapService.list(authContext),
      };
    },
  });
};
