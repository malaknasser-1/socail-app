import { Types } from "mongoose";

export interface IPost {
  _id?: Types.ObjectId;
  author: Types.ObjectId;
  content: string;
  image?: string;
  createdAt?: Date;
}