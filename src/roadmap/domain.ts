import { z } from 'zod';
import { UserId } from '../user/domain';

export const RoadmapId = z.string().uuid();
export type RoadmapId = z.infer<typeof RoadmapId>;

export const RoadmapName = z.string().min(1).max(100).trim();
export type RoadmapName = z.infer<typeof RoadmapName>;

export const Roadmap = z.object({
  id: RoadmapId,
  userId: UserId,
  name: RoadmapName,
  createdAt: z.date(),
});
export type Roadmap = z.infer<typeof Roadmap>;
