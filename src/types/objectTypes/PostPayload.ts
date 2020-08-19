import { Field, Int, ObjectType } from "type-graphql";
import { Post } from "../../entity/Post.entity";

@ObjectType()
export class PostPayload {
    @Field(() => Int)
    postsCount: number;

    @Field(() => [Post])
    posts: Post[];
}
