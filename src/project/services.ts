import { randomUUID } from 'crypto';
import winston from 'winston';

import { AuthContext } from '../auth/domain';
import { Transactor } from '../utils/db/transactor';
import { Project, ProjectId } from './domain';
import { CreateProjectRequest, CreateProjectResponse, UpdateProjectRequest, UpdateProjectResponse } from './dtos';
import { ProjectRepository } from './repository';

export interface ProjectService {
  insert: (authContext: AuthContext, request: CreateProjectRequest) => Promise<CreateProjectResponse>;
  list: (authContext: AuthContext) => Promise<ReadonlyArray<Project>>;
  update: (authContext: AuthContext, id: ProjectId, request: UpdateProjectRequest) => Promise<UpdateProjectResponse>;
  find: (authContext: AuthContext, id: ProjectId) => Promise<Project | undefined>;
}

export const makeProjectService = (projectRepository: ProjectRepository, transactor: Transactor, logger: winston.Logger): ProjectService => {
  return {
    insert: async (authContext: AuthContext, request: CreateProjectRequest): Promise<CreateProjectResponse> => {
      logger.info('Creating project...');
      const project: Project = {
        ...request,
        id: ProjectId.parse(randomUUID()),
        userId: authContext.id,
        createdAt: new Date(),
      };

      return transactor.withTransaction(async (connection) => {
        const maybeProject = await projectRepository.find(connection, { name: request.name, userId: authContext.id });
        if (maybeProject.length > 0) {
          return { status: 'AlreadyExists', project: maybeProject.at(0) as Project };
        }
        await projectRepository.insert(connection, project);
        return { status: 'Created', project };
      });
    },
    list: async (authContext: AuthContext): Promise<ReadonlyArray<Project>> => {
      return transactor.withTransaction(async (connection) => {
        return projectRepository.find(connection, { userId: authContext.id });
      });
    },
    update: async (authContext: AuthContext, id: ProjectId, request: UpdateProjectRequest): Promise<UpdateProjectResponse> => {
      logger.info('Updating project...');
      return transactor.withTransaction(async (connection) => {
        const maybeProject = await projectRepository.find(connection, { id: id, userId: authContext.id });
        if (maybeProject.length === 0) {
          return { status: 'NotFound' };
        }
        const project = maybeProject.at(0) as Project;
        const updatedProject: Project = {
          ...project,
          name: request.name || project.name,
          description: request.description || project.description,
        };
        const maybeUpdatedProject = await projectRepository.find(connection, { name: updatedProject.name, userId: authContext.id });
        if (maybeUpdatedProject.length > 0 && request.name && request.name !== project.name) {
          return { status: 'AlreadyExists', project: maybeUpdatedProject.at(0) as Project };
        }
        await projectRepository.update(connection, updatedProject);
        return { status: 'Updated', project: updatedProject };
      });
    },
    find: async (authContext: AuthContext, id: ProjectId): Promise<Project | undefined> => {
      return transactor.withTransaction(async (connection) => {
        const maybeProject = await projectRepository.find(connection, { id: id, userId: authContext.id });
        return maybeProject.at(0);
      });
    },
  };
};
