import { Arg, FieldResolver, Query, Resolver, Root } from "type-graphql";
import { Comment } from "../../entity/Comment.entity";
import { Post } from "../../entity/Post.entity";
import { User } from "../../entity/User.entity";
import { getCommentsInput } from "./InputTypes/getCommentsInput";

@Resolver(() => Comment)
export class CommentQueryResolver {
    @Query(() => [Comment])
    async getComments(
        @Arg("data") { skip, take, postId }: getCommentsInput
    ): Promise<Comment[]> {
        const comments = await Comment.find({
            where: { post: postId },
            order: { createdAt: "DESC" },
            skip,
            take,
        });
        return comments;
    }

    @FieldResolver()
    async author(@Root() { id }: Comment): Promise<User> {
        const fullComment = await Comment.findOne(id, {
            relations: ["author"],
        });
        if (fullComment) {
            return fullComment.author;
        }

        throw new Error("No author for this comment");
    }

    @FieldResolver()
    async post(@Root() { id }: Comment): Promise<Post> {
        const fullComment = await Comment.findOne(id, { relations: ["post"] });
        if (fullComment) {
            return fullComment.post;
        }

        throw new Error("No post associated with this comment");
    }
}
