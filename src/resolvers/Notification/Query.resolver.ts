import {
    Ctx,
    FieldResolver,
    Query,
    Resolver,
    Root,
    UseMiddleware,
} from "type-graphql";
import { Notification } from "../../entity/Notification.entity";
import { User } from "../../entity/User.entity";
import { isAuth } from "../../middlewares/isAuth";
import { ContextType } from "../../types/interfaces/ContextType";

@Resolver(() => Notification)
export class NotificationsQueryResolver {
    @Query(() => [Notification])
    @UseMiddleware(isAuth)
    async getNotifications(@Ctx() ctx: ContextType): Promise<Notification[]> {
        const user = await User.findOne(ctx.req.session!.userId);

        if (user) {
            const notifications = await Notification.find({
                where: { to: user },
            });
            return notifications;
        }

        throw new Error("Not authenticated");
    }

    @FieldResolver()
    async changer(@Root() notification: Notification) {
        const fullNotification = await Notification.findOne(notification.id, {
            relations: ["changer"],
        });
        if (fullNotification) {
            return fullNotification.changer;
        }

        throw new Error("There is no changer to this notification");
    }

    @FieldResolver()
    async changed(@Root() notification: Notification) {
        const fullNotification = await Notification.findOne(notification.id, {
            relations: ["changed"],
        });
        if (fullNotification) {
            return fullNotification.changed;
        }

        throw new Error("There is no post associated with this notification");
    }
}
