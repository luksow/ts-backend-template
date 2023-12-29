import { z } from 'zod';

import { Project, ProjectDescription, ProjectName } from './domain';

export const CreateProjectRequest = z.object({
  name: ProjectName,
  description: z.optional(ProjectDescription),
});
export type CreateProjectRequest = z.infer<typeof CreateProjectRequest>;

export type CreateProjectResponse = { status: 'Created'; project: Project } | { status: 'AlreadyExists'; project: Project };

export const UpdateProjectRequest = z.object({
  name: z.optional(ProjectName),
  description: z.optional(ProjectDescription),
});
export type UpdateProjectRequest = z.infer<typeof UpdateProjectRequest>;

export type UpdateProjectResponse = { status: 'Updated'; project: Project } | { status: 'NotFound' } | { status: 'AlreadyExists'; project: Project };
