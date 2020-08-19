import { Arg, Ctx, Query, Resolver, UseMiddleware } from "type-graphql";
import { In, Not } from "typeorm";
import { Post } from "../../../entity/Post.entity";
import { User } from "../../../entity/User.entity";
import { findOrCreateView } from "../../../middlewares/findOrCreateView";
import { isAuth } from "../../../middlewares/isAuth";
import { ContextType } from "../../../types/interfaces/ContextType";
import { PostPayload } from "../../../types/objectTypes/PostPayload";
import { getPostsInput } from "../InputTypes/GetPostsInput";

@Resolver(() => PostPayload)
export class PostsQueryResolver {
    @Query(() => PostPayload)
    @UseMiddleware(isAuth)
    async getFollowedPosts(
        @Ctx() ctx: ContextType,
        @Arg("data") { skip, take, sortBy, sortOrder }: getPostsInput
    ): Promise<PostPayload> {
        const user = await User.findOne(ctx.req.session!.userId, {
            relations: ["following"],
        });
        if (user) {
            const followingUsersIds = user.following.map((usr) => usr.id);
            const view = await findOrCreateView(user.id);

            if (followingUsersIds.length === 0) {
                return {
                    posts: [],
                    postsCount: 0,
                };
            }

            const posts = await Post.find({
                where: {
                    id: Not(In(view.postIds)),
                    author: In(followingUsersIds),
                },
                order: {
                    [sortBy]: sortOrder,
                },
                skip,
                take,
            });
            const postsCount = await Post.count({
                where: { author: In(followingUsersIds) },
            });

            view.postIds = [...view.postIds, ...posts.map((pst) => pst.id)];
            await view.save();
            console.log(view);

            return {
                posts,
                postsCount,
            };
        }

        throw new Error("Not authenticated");
    }

    @Query(() => PostPayload)
    @UseMiddleware(isAuth)
    async getPosts(
        @Ctx() ctx: ContextType,
        @Arg("data") { skip, take, sortBy, sortOrder }: getPostsInput
    ): Promise<PostPayload> {
        const user = await User.findOne(ctx.req.session!.userId, {
            relations: ["following"],
        });

        if (user) {
            const followingUsersIds = user.following.map((usr) => usr.id);
            const view = await findOrCreateView(user.id);

            if (followingUsersIds.length === 0) {
                followingUsersIds.push(0);
            }

            const posts = await Post.find({
                where: {
                    id: Not(In(view.postIds)),
                    author: Not(In(followingUsersIds)),
                },
                order: {
                    [sortBy]: sortOrder,
                },
                skip,
                take,
            });
            const postsCount = await Post.count({
                where: { author: Not(In(followingUsersIds)) },
            });

            view.postIds = [...view.postIds, ...posts.map((pst) => pst.id)];
            await view.save();

            return {
                posts,
                postsCount,
            };
        }

        throw new Error("Not authenticated");
    }
}
