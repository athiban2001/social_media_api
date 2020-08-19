import { Min } from "class-validator";
import { Field, InputType, Int } from "type-graphql";

@InputType()
export class getCommentsInput {
    @Field(() => Int)
    skip: number;

    @Field(() => Int)
    @Min(1)
    take: number;

    @Field(() => Int)
    postId: number;
}
