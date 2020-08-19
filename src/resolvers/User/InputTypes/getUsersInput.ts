import { Length, Min } from "class-validator";
import { Field, InputType, Int } from "type-graphql";

@InputType()
export class getUsersInput {
    @Field(() => String)
    @Length(1, 255)
    queryString: string;

    @Field(() => Int)
    skip: number;

    @Field(() => Int)
    @Min(1)
    take: number;
}
