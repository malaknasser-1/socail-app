import { z } from "zod";

export const updateProfileDto = z
  .object({
    name: z.string().trim().min(2).max(50).optional(),
    bio: z.string().trim().max(200).optional(),
    avatar: z.string().url().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "Nothing to update" });

export const settingsDto = z.object({ isPrivate: z.boolean() });

export const idParamDto = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid id"),
});

export const searchQueryDto = z.object({
  q: z.string().trim().min(1),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const paginationDto = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type UpdateProfileDto = z.infer<typeof updateProfileDto>;
