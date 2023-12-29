import { DatabasePoolConnection, QueryResult, ValueExpression } from 'slonik';

import { UserId } from '../user/domain';
import { sql } from '../utils/db/sql';
import { Project, ProjectDescription, ProjectId, ProjectName } from './domain';

export interface ProjectRepository {
  insert(connection: DatabasePoolConnection, project: Project): Promise<QueryResult<object>>;
  find(connection: DatabasePoolConnection, filter: ProjectFilter): Promise<ReadonlyArray<Project>>;
  update(connection: DatabasePoolConnection, project: Project): Promise<QueryResult<object>>;
}

export interface ProjectFilter {
  id?: ProjectId;
  name?: ProjectName;
  description?: ProjectDescription;
  createdAt?: Date;
  userId?: UserId;
}

export function makeProjectRepository(): ProjectRepository {
  const filterClauses = (filter: ProjectFilter): Array<ValueExpression> => {
    const clauses: Array<ValueExpression> = ['true'];
    filter.id ? clauses.push(sql.fragment`id = ${filter.id}`) : null;
    filter.name ? clauses.push(sql.fragment`name = ${filter.name}`) : null;
    filter.description ? clauses.push(sql.fragment`description = ${filter.description}`) : null;
    filter.createdAt ? clauses.push(sql.fragment`created_at = ${sql.date(filter.createdAt)}`) : null;
    filter.userId ? clauses.push(sql.fragment`user_id = ${filter.userId}`) : null;
    return clauses;
  };
  return {
    insert(connection: DatabasePoolConnection, project: Project) {
      return connection.query(
        sql.typeAlias('void')`INSERT INTO project (id, user_id, name, description, created_at) VALUES (${project.id}, ${project.userId}, ${project.name}, ${
          project.description || null
        }, ${sql.date(project.createdAt)})`,
      );
    },
    find(connection: DatabasePoolConnection, filter: ProjectFilter): Promise<ReadonlyArray<Project>> {
      return connection.any(
        sql.type(Project)`SELECT id as id, user_id as "userId", name as name, description as description, created_at as "createdAt" FROM project WHERE ${sql.join(
          filterClauses(filter),
          sql.fragment` AND `,
        )}`,
      );
    },
    update(connection: DatabasePoolConnection, project: Project) {
      return connection.query(
        sql.typeAlias('void')`UPDATE project SET name = ${project.name}, description = ${project.description || null}, user_id = ${project.userId}, created_at = ${sql.date(
          project.createdAt,
        )}  WHERE id = ${project.id}`,
      );
    },
  };
}
