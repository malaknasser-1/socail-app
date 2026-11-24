import { z } from "zod";

export const createCommentDto = z.object({
  content: z.string().trim().min(1, "Content is required").max(1000),
});

export const updateCommentDto = createCommentDto;

export const postIdParamDto = z.object({
  postId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid post id"),
});

export type CreateCommentDto = z.infer<typeof createCommentDto>;