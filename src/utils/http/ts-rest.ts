import { initContract } from '@ts-rest/core';
import { initServer } from '@ts-rest/express';
import { z } from 'zod';

export const c = initContract();
export const s = initServer();

export const baseApi = {
  baseHeaders: z.object({
    authorization: z.string().optional(),
  }),
};

export const baseAuthenticatedApi = {
  ...baseApi,
  baseHeaders: z.object({
    authorization: z.string(),
  }),
};
