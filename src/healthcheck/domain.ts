import { z } from 'zod';
import { UserId } from '../user/domain';

export const HealthCheck = z.object({
  name: z.string(),
  environment: z.string(),
  version: z.string(),
  userId: UserId.optional(),
});
export type HealthCheck = z.infer<typeof HealthCheck>;

export const DbHealthCheck = z.object({
  latency: z.number(),
});
export type DbHealthCheck = z.infer<typeof DbHealthCheck>;
