import winston from 'winston';

import { AuthContext } from '../auth/domain';
import { UserId } from '../user/domain';
import { Roadmap } from './domain';

export interface RoadmapService {
  list: (authContext: AuthContext) => Promise<Array<Roadmap>>;
}

export const makeRoadmapService = (logger: winston.Logger): RoadmapService => {
  return {
    list: async (): Promise<Array<Roadmap>> => {
      logger.info('Getting roadmaps :scream:');
      return [
        {
          id: '017959c6-69e6-4cdb-aa92-53c628ba0c02',
          userId: UserId.parse('017959c6-69e6-4cdb-aa92-53c628ba0c01'),
          name: 'Roadmap 1',
          createdAt: new Date(),
        },
        {
          id: '017959c6-69e6-4cdb-aa92-53c628ba0c03',
          userId: UserId.parse('017959c6-69e6-4cdb-aa92-53c628ba0c01'),
          name: 'Roadmap 2',
          createdAt: new Date(),
        },
        {
          id: '017959c6-69e6-4cdb-aa92-53c628ba0c04',
          userId: UserId.parse('017959c6-69e6-4cdb-aa92-53c628ba0c01'),
          name: 'Roadmap 3',
          createdAt: new Date(),
        },
      ];
    },
  };
};
