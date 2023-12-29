import { z } from 'zod';

import { Authenticator } from '../auth/authenticator';
import { ErrorResponse } from '../utils/http/middleware';
import { baseAuthenticatedApi, c, s } from '../utils/http/ts-rest';
import { Project, ProjectId } from './domain';
import { CreateProjectRequest, UpdateProjectRequest } from './dtos';
import { ProjectService } from './services';

export const projectApi = c.router(
  {
    createProject: {
      method: 'POST',
      path: '/projects',
      body: CreateProjectRequest,
      responses: {
        201: Project,
        409: ErrorResponse,
        401: ErrorResponse,
      },
    },
    listProjects: {
      method: 'GET',
      path: '/projects',
      responses: {
        200: z.array(Project),
        401: ErrorResponse,
      },
    },
    findProject: {
      method: 'GET',
      path: '/projects/:id',
      responses: {
        200: Project,
        404: ErrorResponse,
      },
    },
    updateProject: {
      method: 'PATCH',
      path: '/projects/:id',
      body: UpdateProjectRequest,
      responses: {
        200: Project,
        404: ErrorResponse,
        409: ErrorResponse,
      },
    },
  },
  { ...baseAuthenticatedApi, strictStatusCodes: true },
);

export const makeProjectRouter = (projectService: ProjectService, authenticator: Authenticator) => {
  return s.router(projectApi, {
    createProject: async (req) => {
      const authContext = await authenticator.authenticateOrThrow(req);
      const response = await projectService.insert(authContext, req.body);
      switch (response.status) {
        case 'Created':
          return {
            status: 201,
            body: response.project,
          };
        case 'AlreadyExists':
          return {
            status: 409,
            body: { message: 'Project already exists' },
          };
      }
    },
    listProjects: async (req) => {
      const authContext = await authenticator.authenticateOrThrow(req);
      return {
        status: 200,
        body: [...(await projectService.list(authContext))],
      };
    },
    findProject: async (req) => {
      const authContext = await authenticator.authenticateOrThrow(req);
      const id = ProjectId.parse(req.params.id);
      const maybeProject = await projectService.find(authContext, id);
      if (maybeProject === undefined) {
        return {
          status: 404,
          body: { message: 'Project not found' },
        };
      }
      return {
        status: 200,
        body: maybeProject,
      };
    },
    updateProject: async (req) => {
      const authContext = await authenticator.authenticateOrThrow(req);
      const id = ProjectId.parse(req.params.id);
      const response = await projectService.update(authContext, id, req.body);
      switch (response.status) {
        case 'Updated':
          return {
            status: 200,
            body: response.project,
          };
        case 'NotFound':
          return {
            status: 404,
            body: { message: 'Project not found' },
          };
        case 'AlreadyExists':
          return {
            status: 409,
            body: { message: 'Project already exists' },
          };
      }
    },
  });
};
