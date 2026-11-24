import { AbstractRepository } from "../../../lib/db/abstract.repository";
import { IPost } from "../interface/post.interface";
import { PostModel } from "../model/post.model";

class PostRepository extends AbstractRepository<IPost> {
  constructor() {
    super(PostModel);
  }

  findByAuthor(authorId: string, page: number, limit: number) {
    return this.find({ author: authorId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("author", "name avatar");
  }
}

export const postRepository = new PostRepository();