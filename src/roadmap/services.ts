import { randomUUID } from 'crypto';
import winston from 'winston';

import { AuthContext } from '../auth/domain';
import { Transactor } from '../utils/db/transactor';
import { Roadmap, RoadmapId } from './domain';
import { CreateRoadmapRequest, CreateRoadmapResponse, UpdateRoadmapRequest, UpdateRoadmapResponse } from './dtos';
import { RoadmapRepository } from './repository';

export interface RoadmapService {
  insert: (authContext: AuthContext, request: CreateRoadmapRequest) => Promise<CreateRoadmapResponse>;
  list: (authContext: AuthContext) => Promise<ReadonlyArray<Roadmap>>;
  update: (authContext: AuthContext, id: RoadmapId, request: UpdateRoadmapRequest) => Promise<UpdateRoadmapResponse>;
  find: (authContext: AuthContext, id: RoadmapId) => Promise<Roadmap | undefined>;
}

export const makeRoadmapService = (roadmapRepository: RoadmapRepository, transactor: Transactor, logger: winston.Logger): RoadmapService => {
  return {
    insert: async (authContext: AuthContext, request: CreateRoadmapRequest): Promise<CreateRoadmapResponse> => {
      logger.info('Creating roadmap...');
      const roadmap: Roadmap = {
        ...request,
        id: RoadmapId.parse(randomUUID()),
        userId: authContext.id,
        createdAt: new Date(),
      };

      return transactor.withTransaction(async (connection) => {
        const maybeRoadmap = await roadmapRepository.find(connection, { name: request.name, userId: authContext.id });
        if (maybeRoadmap.length > 0) {
          return { status: 'AlreadyExists', roadmap: maybeRoadmap.at(0) as Roadmap };
        }
        await roadmapRepository.insert(connection, roadmap);
        return { status: 'Created', roadmap };
      });
    },
    list: async (authContext: AuthContext): Promise<ReadonlyArray<Roadmap>> => {
      return transactor.withTransaction(async (connection) => {
        return roadmapRepository.find(connection, { userId: authContext.id });
      });
    },
    update: async (authContext: AuthContext, id: RoadmapId, request: UpdateRoadmapRequest): Promise<UpdateRoadmapResponse> => {
      logger.info('Updating roadmap...');
      return transactor.withTransaction(async (connection) => {
        const maybeRoadmap = await roadmapRepository.find(connection, { id: id, userId: authContext.id });
        if (maybeRoadmap.length === 0) {
          return { status: 'NotFound' };
        }
        const roadmap = maybeRoadmap.at(0) as Roadmap;
        const updatedRoadmap: Roadmap = {
          ...roadmap,
          name: request.name || roadmap.name,
          description: request.description || roadmap.description,
        };
        const maybeUpdatedRoadmap = await roadmapRepository.find(connection, { name: updatedRoadmap.name, userId: authContext.id });
        if (maybeUpdatedRoadmap.length > 0 && request.name && request.name !== roadmap.name) {
          return { status: 'AlreadyExists', roadmap: maybeUpdatedRoadmap.at(0) as Roadmap };
        }
        await roadmapRepository.update(connection, updatedRoadmap);
        return { status: 'Updated', roadmap: updatedRoadmap };
      });
    },
    find: async (authContext: AuthContext, id: RoadmapId): Promise<Roadmap | undefined> => {
      return transactor.withTransaction(async (connection) => {
        const maybeRoadmap = await roadmapRepository.find(connection, { id: id, userId: authContext.id });
        return maybeRoadmap.at(0);
      });
    },
  };
};
