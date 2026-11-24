import { Types } from "mongoose";

export interface IComment {
  _id?: Types.ObjectId;
  post: Types.ObjectId;
  author: Types.ObjectId;
  content: string;
  createdAt?: Date;
}