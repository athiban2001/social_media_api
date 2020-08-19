import {
    Arg,
    Ctx,
    FieldResolver,
    Query,
    Resolver,
    ResolverInterface,
    Root,
    UseMiddleware,
} from "type-graphql";
import { Comment } from "../../../entity/Comment.entity";
import { Post } from "../../../entity/Post.entity";
import { User } from "../../../entity/User.entity";
import { isAuth } from "../../../middlewares/isAuth";
import { ContextType } from "../../../types/interfaces/ContextType";

@Resolver(() => Post)
export class PostQueryResolver implements ResolverInterface<Post> {
    @Query(() => [Post])
    @UseMiddleware(isAuth)
    async myPosts(@Ctx() ctx: ContextType): Promise<Post[]> {
        const user = await User.findOne(ctx.req.session!.userId);
        if (user) {
            const posts = await Post.find({ where: { author: user } });
            return posts;
        }

        throw new Error("Not authenticated");
    }

    @Query(() => Post)
    @UseMiddleware(isAuth)
    async getPost(@Arg("postId") postId: number): Promise<Post> {
        const post = await Post.findOne(postId);
        if (post) {
            return post;
        }

        throw new Error("There is no post with that ID");
    }

    @FieldResolver()
    async author(@Root() { id }: Post) {
        const fullPost = await Post.findOne(id, { relations: ["author"] });
        if (fullPost) {
            return fullPost.author;
        }
        throw new Error("There is no author for this post");
    }

    @FieldResolver()
    async comments(@Root() post: Post) {
        const comments = await Comment.find({ where: { post: post } });
        return comments;
    }
}
