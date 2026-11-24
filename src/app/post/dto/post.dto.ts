import { z } from "zod";

export const createPostDto = z.object({
  content: z.string().trim().min(1, "Content is required").max(2000),
  image: z.string().url().optional(),
});

export const updatePostDto = z
  .object({
    content: z.string().trim().min(1).max(2000).optional(),
    image: z.string().url().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "Nothing to update" });

export type CreatePostDto = z.infer<typeof createPostDto>;
export type UpdatePostDto = z.infer<typeof updatePostDto>;