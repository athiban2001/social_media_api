import { Notification } from "../entity/Notification.entity";
import { NotificationPayload } from "../types/interfaces/NotificationPayload";

export const createNotifications = async (payload: NotificationPayload) => {
    for (const userId of payload.to) {
        if (payload.changed) {
            await Notification.create({
                payloadId: payload.payloadId,
                type: payload.type,
                changer: payload.changer,
                changed: payload.changed,
                to: { id: userId },
            }).save();
        } else {
            await Notification.create({
                payloadId: payload.payloadId,
                type: payload.type,
                changer: payload.changer,
                to: { id: userId },
            }).save();
        }
    }
};
