import { z } from 'zod';

import { Roadmap, RoadmapDescription, RoadmapName } from './domain';

export const CreateRoadmapRequest = z.object({
  name: RoadmapName,
  description: z.nullable(RoadmapDescription),
});
export type CreateRoadmapRequest = z.infer<typeof CreateRoadmapRequest>;

export type CreateRoadmapResponse = { status: 'Created'; roadmap: Roadmap } | { status: 'AlreadyExists'; roadmap: Roadmap };

export const UpdateRoadmapRequest = z.object({
  name: z.optional(RoadmapName),
  description: z.optional(RoadmapDescription),
});
export type UpdateRoadmapRequest = z.infer<typeof UpdateRoadmapRequest>;

export type UpdateRoadmapResponse = { status: 'Updated'; roadmap: Roadmap } | { status: 'NotFound' } | { status: 'AlreadyExists'; roadmap: Roadmap };
