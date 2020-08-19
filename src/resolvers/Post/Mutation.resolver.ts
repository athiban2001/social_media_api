import fs from "fs/promises";
import { nanoid } from "nanoid";
import path from "path";
import sharp from "sharp";
import streamToPromise from "stream-to-promise";
import {
    Arg,
    Ctx,
    Mutation,
    PubSub,
    PubSubEngine,
    Resolver,
    UseMiddleware,
} from "type-graphql";
import { createNotifications } from "../../middlewares/createNotifications";
import { Post } from "./../../entity/Post.entity";
import { User } from "./../../entity/User.entity";
import { isAuth } from "./../../middlewares/isAuth";
import { ContextType } from "./../../types/interfaces/ContextType";
import { NotificationPayload } from "./../../types/interfaces/NotificationPayload";
import { CreatePostInput } from "./InputTypes/CreatePostInput";
import { UpdatePostInput } from "./InputTypes/UpdatePostInput";

@Resolver(() => Post)
export class CreatePostResolver {
    @Mutation(() => Post)
    @UseMiddleware(isAuth)
    async createPost(
        @Arg("data") { title, body, postImage }: CreatePostInput,
        @Ctx() ctx: ContextType,
        @PubSub() pubSub: PubSubEngine
    ): Promise<Post> {
        const user = await User.findOne(ctx.req.session!.userId, {
            relations: ["followers"],
        });
        const lastPost = await Post.findOne({ order: { id: "DESC" } });
        if (user) {
            let lastPostId = 1;
            if (lastPost) {
                lastPostId = lastPost.id + 1;
            }

            const { createReadStream } = postImage;
            const buffer = await streamToPromise(createReadStream());

            await sharp(buffer)
                .resize(940, 788)
                .png()
                .toFile(
                    path.join(__dirname, `../../uploads/post/${lastPostId}.png`)
                );

            const newPost = await Post.create({
                title,
                body,
                author: user,
                image: `/db/post/${lastPostId}`,
            }).save();
            const to = user.followers.map((usr) => usr.id);

            const payload: NotificationPayload = {
                payloadId: nanoid(),
                type: "POST",
                changer: user,
                changed: newPost,
                to,
            };
            createNotifications(payload);
            await pubSub.publish("NOTIICATIONS", payload);

            return newPost;
        }

        throw new Error("No User found");
    }

    @Mutation(() => Post)
    @UseMiddleware(isAuth)
    async updatePost(
        @Ctx() ctx: ContextType,
        @Arg("postId") postId: number,
        @Arg("data") data: UpdatePostInput
    ): Promise<Post> {
        const user = await User.findOne(ctx.req.session!.userId);
        const post = await Post.findOne(postId, {
            where: { author: user },
        });
        if (user && post) {
            if (data.title) {
                post.title = data.title;
            }
            if (data.body) {
                post.body = data.body;
            }
            if (data.postImage) {
                const { createReadStream } = data.postImage;
                const buffer = await streamToPromise(createReadStream());
                await sharp(buffer)
                    .resize(940, 788)
                    .png()
                    .toFile(
                        path.join(__dirname, `../../uploads/post/${postId}.png`)
                    );

                post.image = `/db/post/${postId}`;
            }

            await post.save();
            return post;
        }

        throw new Error("You are not the author of this post");
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async deletePost(
        @Arg("postId") postId: number,
        @Ctx() ctx: ContextType
    ): Promise<Boolean> {
        const user = await User.findOne(ctx.req.session!.userId);
        const post = await Post.findOne(postId, {
            where: { author: user },
        });
        if (user && post) {
            await fs.unlink(
                path.join(__dirname, `../../uploads/post/${post.id}.png`)
            );
            await post.remove();
            return true;
        } else {
            throw new Error("You are not the author of this post");
        }
    }
}
