import { Ctx, Resolver, Root, Subscription } from "type-graphql";
import { Notification } from "../../entity/Notification.entity";
import { ContextType } from "../../types/interfaces/ContextType";
import { NotificationPayload } from "../../types/interfaces/NotificationPayload";

@Resolver()
export class NotificationSubscriptionPayload {
    @Subscription(() => Notification, {
        topics: "NOTIFICATIONS",
        filter: ({ payload, context }) => {
            if (context.connection.context.session.userId) {
                return payload.to.includes(
                    context.connection.context.session.userId
                );
            }

            return false;
        },
    })
    async notifications(
        @Root() payload: NotificationPayload,
        @Ctx() ctx: ContextType
    ): Promise<Notification> {
        const notification = await Notification.findOne({
            where: {
                to: { id: ctx.connection.context.session.userId },
                payloadId: payload.payloadId,
            },
        });

        if (notification) {
            return notification;
        }

        throw new Error("This is not possible");
    }
}
