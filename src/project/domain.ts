import { z } from 'zod';

import { UserId } from '../user/domain';

export const ProjectId = z.string().uuid().brand<'ProjectId'>();
export type ProjectId = z.infer<typeof ProjectId>;

export const ProjectName = z.string().min(1).max(100).trim().brand<'ProjectName'>();
export type ProjectName = z.infer<typeof ProjectName>;

export const ProjectDescription = z.string().trim().brand<'ProjectDescription'>();
export type ProjectDescription = z.infer<typeof ProjectDescription>;

export const Project = z.object({
  id: ProjectId,
  userId: UserId,
  name: ProjectName,
  description: z.nullable(ProjectDescription),
  createdAt: z.date(),
});
export type Project = z.infer<typeof Project>;
