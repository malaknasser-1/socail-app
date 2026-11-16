import { Types } from "mongoose";
import { AbstractRepository } from "../../../lib/db/abstract.repository";
import { IFollow } from "../interface/follow.interface";
import { FollowModel } from "../model/follow.model";
import { FollowStatus } from "../enum/follow-status.enum";

class FollowRepository extends AbstractRepository<IFollow> {
  constructor() {
    super(FollowModel);
  }

  findRelation(follower: string, following: string) {
    return this.findOne({ follower, following });
  }

  async getFollowingIds(userId: string): Promise<Types.ObjectId[]> {
    const docs = await this.find({ follower: userId }).select("following");
    return docs.map((d) => d.following);
  }

  
  mutualSuggestions(followingIds: Types.ObjectId[], exclude: Types.ObjectId[], limit: number) {
    return this.model.aggregate([
      { $match: { follower: { $in: followingIds }, status: FollowStatus.ACCEPTED, following: { $nin: exclude } } },
      { $group: { _id: "$following", mutuals: { $sum: 1 } } },
      { $sort: { mutuals: -1 } },
      { $limit: limit },
    ]);
  }
}

export const followRepository = new FollowRepository();
