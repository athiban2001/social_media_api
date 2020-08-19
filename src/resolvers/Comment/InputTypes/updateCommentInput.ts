import { MinLength } from "class-validator";
import { Field, InputType, Int } from "type-graphql";
import { text } from "../../../types/decorators/text";

@InputType()
export class UpdateCommentInput {
    @Field(() => Int)
    commentId: number;

    @Field()
    @MinLength(20)
    @text({ message: "Cannot use bad words" })
    text: string;
}
