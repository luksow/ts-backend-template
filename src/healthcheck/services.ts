import { DatabasePool, sql } from 'slonik';
import { AuthContext } from '../auth/domain';
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

export const makeHealthCheckService = (pool: DatabasePool, config: HealthCheckConfig): HealthCheckService => {
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
      await pool.query(sql.unsafe`SELECT 1`);
      const latency = Date.now() - start;
      return {
        latency,
      };
    },
  };
};
