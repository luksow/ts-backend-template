import { AppRoute, AppRouter } from '@ts-rest/core';
import { TsRestRequestHandler } from '@ts-rest/express';
import { AsyncLocalStorage } from 'async_hooks';
import { randomUUID } from 'crypto';
import { ErrorRequestHandler } from 'express';
import winston from 'winston';
import { z } from 'zod';
import { AuthenticationError } from '../../auth/authenticator';
import { UserId } from '../../user/domain';

export const ErrorResponse = z.object({ message: z.string() });
export type ErrorResponse = z.infer<typeof ErrorResponse>;

export const TracingContext = z.object({
  correlationId: z.string().uuid(),
  userId: UserId.optional(),
});
export type TracingContext = z.infer<typeof TracingContext>;

export function makeErrorHandler(logger: winston.Logger) {
  const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
    logger.error('Error while processing request', { error: err });
    if (err instanceof z.ZodError) res.status(400).json(err.message);
    else if (err instanceof AuthenticationError) res.status(401).json({ message: err.message });
    else if (err.statusCode) res.status(err.statusCode).json({ message: err.message });
    else res.status(500).json({ message: 'Internal server error' });

    next();
  };
  return errorHandler;
}

export function makeRequestResponseLogger<T extends AppRouter | AppRoute>(level: string, logger: winston.Logger) {
  const requestResponseLogger: TsRestRequestHandler<T> = (req, res, next) => {
    const requestMeta = {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
    };
    logger.log(level, 'Request', requestMeta);

    function safeJSONParse(string: string) {
      try {
        return JSON.parse(string);
      } catch (e) {
        return undefined;
      }
    }
    ///
    const end = res.end;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    res.end = function (chunk: any, encoding: any) {
      res.end = end;
      res.end(chunk, encoding);
      const isJson = (res.getHeader('content-type') || '').toString().indexOf('json') > 0;
      const body = isJson ? safeJSONParse(chunk.toString()) || chunk.toString() : undefined;
      const responseMeta = {
        statusCode: res.statusCode,
        headers: JSON.parse(JSON.stringify(res.getHeaders())),
        body: body,
      };
      logger.log(level, 'Response', responseMeta);
    } as typeof res.end;

    next();
  };
  return requestResponseLogger;
}

export function makeTracingMiddleware(asyncLocalStorage: AsyncLocalStorage<TracingContext>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tracingMiddleware = (req: any, res: any, next: any) => {
    const correlationId = (req.headers['correlation-id'] as string) || randomUUID();
    res.setHeader('correlation-id', correlationId);
    asyncLocalStorage.run(
      {
        correlationId: correlationId,
        userId: undefined,
      },
      next,
    );
  };
  return tracingMiddleware;
}
