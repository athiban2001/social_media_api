import { Ctx, Mutation, Resolver, UseMiddleware } from "type-graphql";
import { Notification } from "../../entity/Notification.entity";
import { isAuth } from "../../middlewares/isAuth";
import { ContextType } from "../../types/interfaces/ContextType";

@Resolver(() => Notification)
export class NotificationMutationResolver {
    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async clearNotifications(@Ctx() ctx: ContextType) {
        const notifications = await Notification.find({
            where: { to: { id: ctx.req.session!.userId } },
        });
        await Notification.remove(notifications);
        return true;
    }
}
