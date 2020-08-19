import { MinLength } from "class-validator";
import { Field, InputType, Int } from "type-graphql";
import { text } from "../../../types/decorators/text";

@InputType()
export class AddCommentInput {
    @Field()
    @MinLength(20)
    @text({ message: "Cannot use bad words" })
    text: string;

    @Field(() => Int)
    postId: number;
}
