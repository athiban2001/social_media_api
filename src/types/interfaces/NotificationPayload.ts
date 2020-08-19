import { Post } from "./../../entity/Post.entity";
import { User } from "./../../entity/User.entity";

export interface NotificationPayload {
    payloadId: string;
    type: "LIKE" | "COMMENT" | "FOLLOWER" | "POST";
    changer: User;
    changed?: Post;
    to: number[];
}
