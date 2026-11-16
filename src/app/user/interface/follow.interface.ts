import { Types } from "mongoose";
import { FollowStatus } from "../enum/follow-status.enum";

export interface IFollow {
  follower: Types.ObjectId;
  following: Types.ObjectId;
  status: FollowStatus;
}
