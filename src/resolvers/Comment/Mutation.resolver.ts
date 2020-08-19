import { PubSubEngine } from "apollo-server-express";
import { nanoid } from "nanoid";
import {
    Arg,
    Ctx,
    Mutation,
    PubSub,
    Resolver,
    UseMiddleware,
} from "type-graphql";
import { Comment } from "./../../entity/Comment.entity";
import { Post } from "./../../entity/Post.entity";
import { User } from "./../../entity/User.entity";
import { isAuth } from "./../../middlewares/isAuth";
import { ContextType } from "./../../types/interfaces/ContextType";
import { NotificationPayload } from "./../../types/interfaces/NotificationPayload";
import { AddCommentInput } from "./InputTypes/addCommentInput";
import { UpdateCommentInput } from "./InputTypes/updateCommentInput";

@Resolver(() => Comment)
export class CommentMutationResolver {
    @Mutation(() => Comment)
    @UseMiddleware(isAuth)
    async createComment(
        @Arg("data") { text, postId }: AddCommentInput,
        @Ctx() ctx: ContextType,
        @PubSub() pubSub: PubSubEngine
    ): Promise<Comment> {
        const user = await User.findOne(ctx.req.session!.userId);
        const post = await Post.findOne(postId, { relations: ["author"] });
        if (user && post) {
            const comment = await Comment.create({
                text,
                post,
                author: user,
            }).save();

            const payload: NotificationPayload = {
                payloadId: nanoid(),
                type: "COMMENT",
                changer: user,
                changed: post,
                to: [post.author.id],
            };
            pubSub.publish("NOTIFICATIONS", payload);

            return comment;
        }

        throw new Error("Post not found");
    }

    @Mutation(() => Comment)
    @UseMiddleware(isAuth)
    async updateComment(
        @Arg("data") { text, commentId }: UpdateCommentInput,
        @Ctx() ctx: ContextType
    ): Promise<Comment> {
        const user = await User.findOne(ctx.req.session!.userId);
        const comment = await Comment.findOne(commentId, {
            where: { author: user },
        });
        if (user && comment) {
            comment.text = text;
            await comment.save();

            return comment;
        }

        throw new Error("You cannot edit this comment");
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async deleteComment(
        @Arg("commentId") commentId: number,
        @Ctx() ctx: ContextType
    ): Promise<Boolean> {
        const user = await User.findOne(ctx.req.session!.userId);
        const comment = await Comment.findOne(commentId, {
            where: { author: user },
        });
        if (user && comment) {
            await comment.remove();
            return true;
        }

        throw new Error("You cannot edit this comment");
    }
}
