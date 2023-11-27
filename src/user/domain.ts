import { z } from 'zod';

export const UserId = z.string().brand<'UserId'>();
export type UserId = z.infer<typeof UserId>;

export const Email = z.string().email().brand<'Email'>();
export type Email = z.infer<typeof Email>;

export const Role = z.enum(['Admin', 'User']);
export type Role = z.infer<typeof Role>;
