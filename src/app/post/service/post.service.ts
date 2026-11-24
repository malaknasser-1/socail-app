import { Types } from "mongoose";
import { AppError } from "../../../pkg/errors/app-error";
import { postRepository } from "../repository/post.repository";
import { commentRepository } from "../../comment/repository/comment.repository";
import { userRepository } from "../../user/repository/user.repository";
import { followRepository } from "../../user/repository/follow.repository";
import { FollowStatus } from "../../user/enum/follow-status.enum";
import { CreatePostDto, UpdatePostDto } from "../dto/post.dto";

class PostService {
  async getPostForViewer(viewerId: string, postId: string) {
    const post = await postRepository.findById(postId);
    if (!post) throw new AppError("Post not found", 404);

    const authorId = String(post.author);
    if (authorId !== viewerId) {
      const author = await userRepository.findById(authorId);
      if (author?.isPrivate) {
        const rel = await followRepository.findRelation(viewerId, authorId);
        if (rel?.status !== FollowStatus.ACCEPTED) throw new AppError("This account is private", 403);
      }
    }
    return post;
  }

  private async getOwnedPost(userId: string, postId: string) {
    const post = await postRepository.findById(postId);
    if (!post) throw new AppError("Post not found", 404);
    if (String(post.author) !== userId) throw new AppError("You can only modify your own posts", 403);
    return post;
  }

  async create(userId: string, dto: CreatePostDto) {
    return postRepository.create({ author: new Types.ObjectId(userId), ...dto });
  }

  async getMyPosts(userId: string, page: number, limit: number) {
    return postRepository.findByAuthor(userId, page, limit);
  }

  async getOne(viewerId: string, postId: string) {
    const post = await this.getPostForViewer(viewerId, postId);
    return post.populate("author", "name avatar");
  }

  async update(userId: string, postId: string, dto: UpdatePostDto) {
    await this.getOwnedPost(userId, postId);
    return postRepository.findOneAndUpdate({ _id: postId }, { $set: dto });
  }

  async delete(userId: string, postId: string) {
    await this.getOwnedPost(userId, postId);
    await postRepository.deleteOne({ _id: postId });
    await commentRepository.deleteMany({ post: postId });
    return { message: "Post deleted" };
  }
}

export const postService = new PostService();