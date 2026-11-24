import { AbstractRepository } from "../../../lib/db/abstract.repository";
import { IComment } from "../interface/comment.interface";
import { CommentModel } from "../model/comment.model";

class CommentRepository extends AbstractRepository<IComment> {
  constructor() {
    super(CommentModel);
  }

  findByPost(postId: string, page: number, limit: number) {
    return this.find({ post: postId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("author", "name avatar");
  }
}

export const commentRepository = new CommentRepository();