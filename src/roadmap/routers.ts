import { z } from 'zod';

import { Authenticator } from '../auth/authenticator';
import { ErrorResponse } from '../utils/http/middleware';
import { baseAuthenticatedApi, c, s } from '../utils/http/ts-rest';
import { Roadmap, RoadmapId } from './domain';
import { CreateRoadmapRequest, UpdateRoadmapRequest } from './dtos';
import { RoadmapService } from './services';

export const roadmapApi = c.router(
  {
    createRoadmap: {
      method: 'POST',
      path: '/roadmaps',
      body: CreateRoadmapRequest,
      responses: {
        201: Roadmap,
        409: ErrorResponse,
        401: ErrorResponse,
      },
    },
    listRoadmaps: {
      method: 'GET',
      path: '/roadmaps',
      responses: {
        200: z.array(Roadmap),
        401: ErrorResponse,
      },
    },
    findRoadmap: {
      method: 'GET',
      path: '/roadmaps/:id',
      responses: {
        200: Roadmap,
        404: ErrorResponse,
      },
    },
    updateRoadmap: {
      method: 'PATCH',
      path: '/roadmaps/:id',
      body: UpdateRoadmapRequest,
      responses: {
        200: Roadmap,
        404: ErrorResponse,
        409: ErrorResponse,
      },
    },
  },
  { ...baseAuthenticatedApi, strictStatusCodes: true },
);

export const makeRoadmapRouter = (roadmapService: RoadmapService, authenticator: Authenticator) => {
  return s.router(roadmapApi, {
    createRoadmap: async (req) => {
      const authContext = await authenticator.authenticateOrThrow(req);
      const response = await roadmapService.insert(authContext, req.body);
      switch (response.status) {
        case 'Created':
          return {
            status: 201,
            body: response.roadmap,
          };
        case 'AlreadyExists':
          return {
            status: 409,
            body: { message: 'Roadmap already exists' },
          };
      }
    },
    listRoadmaps: async (req) => {
      const authContext = await authenticator.authenticateOrThrow(req);
      return {
        status: 200,
        body: [...(await roadmapService.list(authContext))],
      };
    },
    findRoadmap: async (req) => {
      const authContext = await authenticator.authenticateOrThrow(req);
      const id = RoadmapId.parse(req.params.id);
      const maybeRoadmap = await roadmapService.find(authContext, id);
      if (maybeRoadmap === undefined) {
        return {
          status: 404,
          body: { message: 'Roadmap not found' },
        };
      }
      return {
        status: 200,
        body: maybeRoadmap,
      };
    },
    updateRoadmap: async (req) => {
      const authContext = await authenticator.authenticateOrThrow(req);
      const id = RoadmapId.parse(req.params.id);
      const response = await roadmapService.update(authContext, id, req.body);
      switch (response.status) {
        case 'Updated':
          return {
            status: 200,
            body: response.roadmap,
          };
        case 'NotFound':
          return {
            status: 404,
            body: { message: 'Roadmap not found' },
          };
        case 'AlreadyExists':
          return {
            status: 409,
            body: { message: 'Roadmap already exists' },
          };
      }
    },
  });
};
