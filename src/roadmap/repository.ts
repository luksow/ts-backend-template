import { DatabasePoolConnection, QueryResult, ValueExpression } from 'slonik';

import { UserId } from '../user/domain';
import { sql } from '../utils/db/sql';
import { Roadmap, RoadmapDescription, RoadmapId, RoadmapName } from './domain';

export interface RoadmapRepository {
  insert(connection: DatabasePoolConnection, roadmap: Roadmap): Promise<QueryResult<object>>;
  find(connection: DatabasePoolConnection, filter: RoadmapFilter): Promise<ReadonlyArray<Roadmap>>;
  update(connection: DatabasePoolConnection, roadmap: Roadmap): Promise<QueryResult<object>>;
}

export interface RoadmapFilter {
  id?: RoadmapId;
  name?: RoadmapName;
  description?: RoadmapDescription;
  createdAt?: Date;
  userId?: UserId;
}

export function makeRoadmapRepository(): RoadmapRepository {
  const filterClauses = (filter: RoadmapFilter): Array<ValueExpression> => {
    const clauses: Array<ValueExpression> = ['true'];
    filter.id ? clauses.push(sql.fragment`id = ${filter.id}`) : null;
    filter.name ? clauses.push(sql.fragment`name = ${filter.name}`) : null;
    filter.description ? clauses.push(sql.fragment`description = ${filter.description}`) : null;
    filter.createdAt ? clauses.push(sql.fragment`created_at = ${sql.date(filter.createdAt)}`) : null;
    filter.userId ? clauses.push(sql.fragment`user_id = ${filter.userId}`) : null;
    return clauses;
  };
  return {
    insert(connection: DatabasePoolConnection, roadmap: Roadmap) {
      return connection.query(
        sql.typeAlias('void')`INSERT INTO roadmap (id, user_id, name, description, created_at) VALUES (${roadmap.id}, ${roadmap.userId}, ${roadmap.name}, ${
          roadmap.description || null
        }, ${sql.date(roadmap.createdAt)})`,
      );
    },
    find(connection: DatabasePoolConnection, filter: RoadmapFilter): Promise<ReadonlyArray<Roadmap>> {
      return connection.any(
        sql.type(Roadmap)`SELECT id as id, user_id as "userId", name as name, description as description, created_at as "createdAt" FROM roadmap WHERE ${sql.join(
          filterClauses(filter),
          sql.fragment` AND `,
        )}`,
      );
    },
    update(connection: DatabasePoolConnection, roadmap: Roadmap) {
      return connection.query(
        sql.typeAlias('void')`UPDATE roadmap SET name = ${roadmap.name}, description = ${roadmap.description || null}, user_id = ${roadmap.userId}, created_at = ${sql.date(
          roadmap.createdAt,
        )}  WHERE id = ${roadmap.id}`,
      );
    },
  };
}
