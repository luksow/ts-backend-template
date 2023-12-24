import { ConnectionRoutine, DatabasePool } from 'slonik';

export interface Transactor {
  withConnection<T>(connectionRoutine: ConnectionRoutine<T>): Promise<T>;
  withTransaction<T>(transactionRoutine: ConnectionRoutine<T>): Promise<T>;
}

export function makeTransactor(pool: DatabasePool): Transactor {
  return {
    withConnection<T>(connectionRoutine: ConnectionRoutine<T>): Promise<T> {
      return pool.connect(connectionRoutine);
    },
    withTransaction<T>(transactionFunction: ConnectionRoutine<T>): Promise<T> {
      return pool.transaction(transactionFunction);
    },
  };
}
