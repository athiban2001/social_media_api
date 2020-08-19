import { Min } from "class-validator";
import { Field, InputType, Int } from "type-graphql";
import { sortBy, sortOrder } from "../../../types/enums/sort";

@InputType()
export class getPostsInput {
    @Field(() => Int)
    skip: number;

    @Field(() => Int)
    @Min(1)
    take: number;

    @Field(() => sortBy)
    sortBy: sortBy;

    @Field(() => sortOrder)
    sortOrder: sortOrder;
}
