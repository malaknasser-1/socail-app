import { Schema, model } from "mongoose";
import { IPost } from "../interface/post.interface";

const postSchema = new Schema<IPost>(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, trim: true, maxlength: 2000 },
    image: String,
  },
  { timestamps: true }
);

postSchema.index({ author: 1, createdAt: -1 });

export const PostModel = model<IPost>("Post", postSchema);