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
import { getConnection, In, Like, Not } from "typeorm";
import { isAuth } from "../../middlewares/isAuth";
import { ContextType } from "../../types/interfaces/ContextType";
import { Comment } from "./../../entity/Comment.entity";
import { Post } from "./../../entity/Post.entity";
import { User } from "./../../entity/User.entity";
import { FollowInput } from "./InputTypes/FollowInput";
import { getUsersInput } from "./InputTypes/getUsersInput";

@Resolver(() => User)
export class UserQueryResolver implements ResolverInterface<User> {
    @Query(() => User)
    @UseMiddleware(isAuth)
    async me(@Ctx() ctx: ContextType): Promise<User> {
        const user = await User.findOne(ctx.req.session!.userId);
        if (!user) {
            throw new Error("User not found");
        }

        return user;
    }

    @Query(() => [User])
    @UseMiddleware(isAuth)
    async getUsers(
        @Arg("data") { queryString, skip, take }: getUsersInput
    ): Promise<User[]> {
        const users = await User.find({
            where: {
                firstName: Like(`${queryString}%`),
                lastName: Like(`${queryString}%`),
                userName: Like(`${queryString}%`),
            },
            order: {
                userName: "ASC",
            },
            skip,
            take,
        });

        return users;
    }

    @Query(() => [User])
    @UseMiddleware(isAuth)
    async suggestedUsers(@Ctx() ctx: ContextType) {
        const user = await User.findOne(ctx.req.session!.userId, {
            relations: ["followers", "following"],
        });

        if (user) {
            const suggestions = user.followers.filter(
                (usr) => !user.following.includes(usr)
            );
            if (suggestions.length <= 10) {
                const followUsersArr = user.following.map((usr) => `${usr.id}`);
                if (followUsersArr.length === 0) {
                    followUsersArr.push("0");
                }
                const additionalUsers = await User.find({
                    where: {
                        id: Not(In(followUsersArr)),
                    },
                    order: { id: "ASC" },
                    skip: 0,
                    take: 10 - suggestions.length,
                });

                return [...suggestions, ...additionalUsers];
            }

            return suggestions;
        }

        throw new Error("Not authenticated");
    }

    @Query(() => [User])
    @UseMiddleware(isAuth)
    async getFollowing(
        @Ctx() ctx: ContextType,
        @Arg("data", { nullable: true }) data: FollowInput
    ): Promise<User[]> {
        const user = await User.findOne(ctx.req.session!.userId);
        if (user) {
            user.following = await getConnection()
                .createQueryBuilder()
                .relation(User, "following")
                .of(user)
                .loadMany();

            if (data) {
                return user.following
                    .sort((a, b) => a.id - b.id)
                    .slice(data.skip, data.take);
            } else {
                return user.following;
            }
        }
        throw new Error("Not authenticated");
    }

    @Query(() => [User])
    @UseMiddleware(isAuth)
    async getFollowers(
        @Ctx() ctx: ContextType,
        @Arg("data", { nullable: true }) data: FollowInput
    ): Promise<User[]> {
        const user = await User.findOne(ctx.req.session!.userId);

        if (user) {
            user.followers = await getConnection()
                .createQueryBuilder()
                .relation(User, "followers")
                .of(user)
                .loadMany();
            if (data) {
                return user.followers
                    .sort((a, b) => a.id - b.id)
                    .slice(data.skip, data.take);
            } else {
                return user.followers;
            }
        }
        throw new Error("Not authenticated");
    }

    @Query(() => Boolean)
    @UseMiddleware(isAuth)
    async isFollow(
        @Arg("userId") userId: number,
        @Ctx() ctx: ContextType
    ): Promise<Boolean> {
        const user = await User.findOne(ctx.req.session!.userId, {
            relations: ["following"],
        });
        const followUser = await User.findOne(userId);
        if (user && followUser) {
            return user.following.includes(followUser);
        }

        throw new Error("User not found with that ID");
    }

    @FieldResolver()
    async posts(@Root() user: User) {
        const posts = await Post.find({ where: { author: user } });
        return posts;
    }

    @FieldResolver()
    async comments(@Root() user: User) {
        const comments = await Comment.find({ where: { author: user } });
        return comments;
    }
}
