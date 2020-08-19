import { nanoid } from "nanoid";
import {
    Arg,
    Ctx,
    Mutation,
    PubSub,
    PubSubEngine,
    Resolver,
    UseMiddleware,
} from "type-graphql";
import { getConnection } from "typeorm";
import { Post } from "../../../entity/Post.entity";
import { User } from "../../../entity/User.entity";
import { createNotifications } from "../../../middlewares/createNotifications";
import { isAuth } from "../../../middlewares/isAuth";
import { ContextType } from "../../../types/interfaces/ContextType";
import { NotificationPayload } from "../../../types/interfaces/NotificationPayload";

@Resolver(() => User)
export class PostLikeMutationResolver {
    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async like(
        @Ctx() ctx: ContextType,
        @Arg("postId") postId: number,
        @PubSub() pubSub: PubSubEngine
    ): Promise<Boolean> {
        const user = await User.findOne(ctx.req.session!.userId);
        const post = await Post.findOne(postId, {
            relations: ["likes", "author"],
        });
        if (user && post) {
            if (post && !post.likes.find((usr) => usr.id === user.id)) {
                post.likes.push(user);
                await post.save();

                const payload: NotificationPayload = {
                    payloadId: nanoid(),
                    type: "LIKE",
                    changer: user,
                    changed: post,
                    to: [post.author.id],
                };
                createNotifications(payload);
                pubSub.publish("NOTIFICATIONS", payload);

                return true;
            }

            throw new Error("You have already liked this post");
        }

        throw new Error("Invalid Post ID");
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async dislike(
        @Ctx() ctx: ContextType,
        @Arg("postId") postId: number
    ): Promise<Boolean> {
        const user = await User.findOne(ctx.req.session!.userId);
        const post = await Post.findOne(postId, { relations: ["likes"] });
        if (user && post) {
            if (post.likes.find((usr) => usr.id === user.id)) {
                await getConnection()
                    .createQueryBuilder()
                    .relation(Post, "likes")
                    .of(post)
                    .remove(user);
                return true;
            }

            throw new Error("You are not liking this post");
        }

        throw new Error("Invalid Post ID");
    }
}
