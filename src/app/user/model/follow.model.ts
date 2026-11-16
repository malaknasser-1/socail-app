import { Schema, model } from "mongoose";
import { IFollow } from "../interface/follow.interface";
import { FollowStatus } from "../enum/follow-status.enum";

const followSchema = new Schema<IFollow>(
  {
    follower: { type: Schema.Types.ObjectId, ref: "User", required: true },
    following: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: Object.values(FollowStatus), default: FollowStatus.ACCEPTED },
  },
  { timestamps: true }
);

followSchema.index({ follower: 1, following: 1 }, { unique: true });
followSchema.index({ following: 1, status: 1 });

export const FollowModel = model<IFollow>("Follow", followSchema);
