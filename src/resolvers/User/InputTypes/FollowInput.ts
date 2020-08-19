import { Min } from "class-validator";
import { Field, InputType, Int } from "type-graphql";

@InputType()
export class FollowInput {
    @Field(() => Int)
    skip: number;

    @Field(() => Int)
    @Min(1)
    take: number;
}
