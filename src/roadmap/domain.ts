import { z } from 'zod';

import { UserId } from '../user/domain';

export const RoadmapId = z.string().uuid().brand<'RoadmapId'>();
export type RoadmapId = z.infer<typeof RoadmapId>;

export const RoadmapName = z.string().min(1).max(100).trim().brand<'RoadmapName'>();
export type RoadmapName = z.infer<typeof RoadmapName>;

export const RoadmapDescription = z.string().trim().brand<'RoadmapDescription'>();
export type RoadmapDescription = z.infer<typeof RoadmapDescription>;

export const Roadmap = z.object({
  id: RoadmapId,
  userId: UserId,
  name: RoadmapName,
  description: z.nullable(RoadmapDescription),
  createdAt: z.date(),
});
export type Roadmap = z.infer<typeof Roadmap>;
