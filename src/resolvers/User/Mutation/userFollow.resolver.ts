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
import { User } from "../../../entity/User.entity";
import { createNotifications } from "../../../middlewares/createNotifications";
import { isAuth } from "../../../middlewares/isAuth";
import { ContextType } from "../../../types/interfaces/ContextType";
import { NotificationPayload } from "../../../types/interfaces/NotificationPayload";

@Resolver(() => User)
export class UserFollowMutationResolver {
    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async follow(
        @Arg("followingId") followingId: number,
        @Ctx() ctx: ContextType,
        @PubSub() pubSub: PubSubEngine
    ): Promise<Boolean> {
        const user = await User.findOne(ctx.req.session!.userId, {
            relations: ["following"],
        });
        if (user && user.id === followingId) {
            throw new Error("User can't follow themselves");
        }
        const followUser = await User.findOne(followingId);

        if (user && followUser) {
            if (!user.following.find((usr) => usr.id === followingId)) {
                await getConnection()
                    .createQueryBuilder()
                    .relation(User, "following")
                    .of(user)
                    .add(followUser);
                const payload: NotificationPayload = {
                    payloadId: nanoid(),
                    type: "FOLLOWER",
                    changer: user,
                    to: [followUser.id],
                };
                createNotifications(payload);
                pubSub.publish("NOTIFICATIONS", payload);
                return true;
            }

            throw new Error("You are already following this person");
        }

        throw new Error("Invalid Following User ID");
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async unfollow(
        @Arg("unfollowingId") unfollowingId: number,
        @Ctx() ctx: ContextType
    ): Promise<Boolean> {
        const user = await User.findOne(ctx.req.session!.userId, {
            relations: ["following"],
        });
        const unfollowUser = await User.findOne(unfollowingId);
        if (user && unfollowUser) {
            if (
                user.following.findIndex((usr) => usr.id === unfollowingId) !==
                -1
            ) {
                await getConnection()
                    .createQueryBuilder()
                    .relation(User, "following")
                    .of(user)
                    .remove(unfollowUser);
                return true;
            } else {
                throw new Error("You are not following this ID");
            }
        }

        throw new Error("Invalid Unfollowing User ID");
    }
}
