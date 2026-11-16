import { Types } from "mongoose";
import { AppError } from "../../../pkg/errors/app-error";
import { userRepository } from "../repository/user.repository";
import { followRepository } from "../repository/follow.repository";
import { FollowStatus } from "../enum/follow-status.enum";
import { UpdateProfileDto } from "../dto/user.dto";

class UserService {
  private async counts(userId: string) {
    const [followersCount, followingCount] = await Promise.all([
      followRepository.countDocuments({ following: userId, status: FollowStatus.ACCEPTED }),
      followRepository.countDocuments({ follower: userId, status: FollowStatus.ACCEPTED }),
    ]);
    return { followersCount, followingCount };
  }

  private async getUserOrFail(id: string) {
    const user = await userRepository.findById(id);
    if (!user) throw new AppError("User not found", 404);
    return user;
  }

  // يقدر يشوف التفاصيل لو: بروفايله / عام / أنا متابعه ومقبول
  private async canView(viewerId: string, target: { id: string; isPrivate: boolean }) {
    if (!target.isPrivate || viewerId === target.id) return true;
    const rel = await followRepository.findRelation(viewerId, target.id);
    return rel?.status === FollowStatus.ACCEPTED;
  }

  // ---------- Profile ----------
  async getMe(userId: string) {
    const user = await this.getUserOrFail(userId);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      bio: user.bio,
      avatar: user.avatar,
      isPrivate: user.isPrivate,
      ...(await this.counts(userId)),
    };
  }

  async getProfile(viewerId: string, targetId: string) {
    const user = await this.getUserOrFail(targetId);
    const rel = await followRepository.findRelation(viewerId, targetId);
    const base = {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      isPrivate: user.isPrivate,
      followStatus: rel?.status ?? null,
      ...(await this.counts(targetId)),
    };
    return (await this.canView(viewerId, user)) ? { ...base, bio: user.bio } : base;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await userRepository.findOneAndUpdate({ _id: userId }, { $set: dto });
    if (!user) throw new AppError("User not found", 404);
    return { id: user.id, name: user.name, bio: user.bio, avatar: user.avatar };
  }

  // ---------- Settings / Privacy ----------
  async updateSettings(userId: string, isPrivate: boolean) {
    const user = await userRepository.findOneAndUpdate({ _id: userId }, { $set: { isPrivate } });
    if (!user) throw new AppError("User not found", 404);
    // لو بقى Public نقبل كل الطلبات المعلقة
    if (!isPrivate) {
      await followRepository.updateMany(
        { following: userId, status: FollowStatus.PENDING },
        { $set: { status: FollowStatus.ACCEPTED } }
      );
    }
    return { isPrivate: user.isPrivate };
  }

  // ---------- Follow ----------
  async follow(me: string, targetId: string) {
    if (me === targetId) throw new AppError("You cannot follow yourself", 400);
    const target = await this.getUserOrFail(targetId);
    if (await followRepository.findRelation(me, targetId)) {
      throw new AppError("Already following or request pending", 409);
    }
    const status = target.isPrivate ? FollowStatus.PENDING : FollowStatus.ACCEPTED;
    await followRepository.create({
      follower: new Types.ObjectId(me),
      following: new Types.ObjectId(targetId),
      status,
    });
    return { status };
  }

  async unfollow(me: string, targetId: string) {
    const res = await followRepository.deleteOne({ follower: me, following: targetId });
    if (res.deletedCount === 0) throw new AppError("You are not following this user", 404);
    return { message: "Unfollowed" };
  }

  async listRequests(me: string) {
    const docs = await followRepository
      .find({ following: me, status: FollowStatus.PENDING })
      .populate("follower", "name avatar");
    return docs.map((d) => d.follower);
  }

  async acceptRequest(me: string, followerId: string) {
    const res = await followRepository.updateOne(
      { follower: followerId, following: me, status: FollowStatus.PENDING },
      { $set: { status: FollowStatus.ACCEPTED } }
    );
    if (res.modifiedCount === 0) throw new AppError("Request not found", 404);
    return { message: "Request accepted" };
  }

  async rejectRequest(me: string, followerId: string) {
    const res = await followRepository.deleteOne({
      follower: followerId,
      following: me,
      status: FollowStatus.PENDING,
    });
    if (res.deletedCount === 0) throw new AppError("Request not found", 404);
    return { message: "Request rejected" };
  }

  async getFollowers(viewerId: string, targetId: string, page: number, limit: number) {
    const target = await this.getUserOrFail(targetId);
    if (!(await this.canView(viewerId, target))) throw new AppError("This account is private", 403);
    const docs = await followRepository
      .find({ following: targetId, status: FollowStatus.ACCEPTED })
      .populate("follower", "name avatar")
      .skip((page - 1) * limit)
      .limit(limit);
    return docs.map((d) => d.follower);
  }

  async getFollowing(viewerId: string, targetId: string, page: number, limit: number) {
    const target = await this.getUserOrFail(targetId);
    if (!(await this.canView(viewerId, target))) throw new AppError("This account is private", 403);
    const docs = await followRepository
      .find({ follower: targetId, status: FollowStatus.ACCEPTED })
      .populate("following", "name avatar")
      .skip((page - 1) * limit)
      .limit(limit);
    return docs.map((d) => d.following);
  }

  // ---------- Search & Suggestions ----------
  async search(me: string, q: string, page: number, limit: number) {
    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return userRepository
      .find({ name: { $regex: safe, $options: "i" }, isEmailVerified: true, _id: { $ne: me } })
      .select("name avatar isPrivate")
      .skip((page - 1) * limit)
      .limit(limit);
  }

  async suggestions(me: string, limit = 10) {
    const followingIds = await followRepository.getFollowingIds(me);
    const exclude = [...followingIds, new Types.ObjectId(me)];

    const mutual = await followRepository.mutualSuggestions(followingIds, exclude, limit);
    const ids: Types.ObjectId[] = mutual.map((m) => m._id);

    if (ids.length < limit) {
      const filler = await userRepository
        .find({ _id: { $nin: [...exclude, ...ids] }, isEmailVerified: true })
        .sort({ createdAt: -1 })
        .limit(limit - ids.length)
        .select("_id");
      ids.push(...filler.map((f) => f._id));
    }

    const users = await userRepository.find({ _id: { $in: ids } }).select("name avatar isPrivate");
    return ids.map((id) => users.find((u) => u.id === String(id))).filter(Boolean);
  }
}

export const userService = new UserService();
