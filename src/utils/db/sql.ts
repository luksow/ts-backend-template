import { createSqlTag } from 'slonik';
import { type Interceptor, type QueryResultRow, SchemaValidationError } from 'slonik';
import { z } from 'zod';

export const createResultParserInterceptor = (): Interceptor => {
  return {
    transformRow: (executionContext, actualQuery, row) => {
      const { resultParser } = executionContext;

      if (!resultParser) {
        return row;
      }

      const validationResult = resultParser.safeParse(row);

      if (!validationResult.success) {
        throw new SchemaValidationError(actualQuery, row, validationResult.error.issues);
      }

      return validationResult.data as QueryResultRow;
    },
  };
};

export const sql = createSqlTag({
  typeAliases: {
    void: z.object({}).strict(),
  },
});
