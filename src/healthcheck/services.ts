import { sql } from 'slonik';

import { AuthContext } from '../auth/domain';
import { Transactor } from '../utils/db/transactor';
import { DbHealthCheck, HealthCheck } from './domain';

interface HealthCheckConfig {
  name: string;
  environment: string;
  version: string;
}

export interface HealthCheckService {
  getHealthCheck: (authContext: AuthContext | undefined) => HealthCheck;
  db: () => Promise<DbHealthCheck>;
}

export const makeHealthCheckService = (transactor: Transactor, config: HealthCheckConfig): HealthCheckService => {
  return {
    getHealthCheck: (authContext: AuthContext | undefined): HealthCheck => {
      return {
        name: config.name,
        environment: config.environment,
        version: config.version,
        userId: authContext?.id,
      };
    },
    db: async (): Promise<DbHealthCheck> => {
      const start = Date.now();
      await transactor.withConnection((connection) => {
        return connection.query(sql.unsafe`SELECT 1`);
      });
      const latency = Date.now() - start;
      return {
        latency,
      };
    },
  };
};
