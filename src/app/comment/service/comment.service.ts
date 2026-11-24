import { Types } from "mongoose";
import { AppError } from "../../../pkg/errors/app-error";
import { commentRepository } from "../repository/comment.repository";
import { postRepository } from "../../post/repository/post.repository";
import { postService } from "../../post/service/post.service";

class CommentService {
  private async getCommentOrFail(id: string) {
    const comment = await commentRepository.findById(id);
    if (!comment) throw new AppError("Comment not found", 404);
    return comment;
  }

  async create(userId: string, postId: string, content: string) {
    await postService.getPostForViewer(userId, postId);
    return commentRepository.create({
      post: new Types.ObjectId(postId),
      author: new Types.ObjectId(userId),
      content,
    });
  }

  async getPostComments(viewerId: string, postId: string, page: number, limit: number) {
    await postService.getPostForViewer(viewerId, postId);
    return commentRepository.findByPost(postId, page, limit);
  }

  async getOne(viewerId: string, commentId: string) {
    const comment = await this.getCommentOrFail(commentId);
    await postService.getPostForViewer(viewerId, String(comment.post));
    return comment.populate("author", "name avatar");
  }

  async update(userId: string, commentId: string, content: string) {
    const comment = await this.getCommentOrFail(commentId);
    if (String(comment.author) !== userId) throw new AppError("You can only edit your own comments", 403);
    return commentRepository.findOneAndUpdate({ _id: commentId }, { $set: { content } });
  }

  async delete(userId: string, commentId: string) {
    const comment = await this.getCommentOrFail(commentId);
    const post = await postRepository.findById(String(comment.post));
    const isCommentOwner = String(comment.author) === userId;
    const isPostOwner = !!post && String(post.author) === userId;
    if (!isCommentOwner && !isPostOwner) {
      throw new AppError("Only the comment owner or the post owner can delete this comment", 403);
    }
    await commentRepository.deleteOne({ _id: commentId });
    return { message: "Comment deleted" };
  }
}

export const commentService = new CommentService();