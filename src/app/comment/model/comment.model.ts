import { Schema, model } from "mongoose";
import { IComment } from "../interface/comment.interface";

const commentSchema = new Schema<IComment>(
  {
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

commentSchema.index({ post: 1, createdAt: -1 });

export const CommentModel = model<IComment>("Comment", commentSchema);