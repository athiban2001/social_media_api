import { Length, MinLength } from "class-validator";
import { Field, InputType } from "type-graphql";
import { isEmailOrUserName } from "../../../types/decorators/emailOrUsername";

@InputType()
export class UpdateProfileInput {
    @Field({ nullable: true })
    @Length(1, 255)
    firstName?: string;

    @Field({ nullable: true })
    @Length(1, 255)
    lastName?: string;

    @Field({ nullable: true })
    @isEmailOrUserName({ message: "User Name already taken" })
    @Length(8, 255)
    userName?: string;

    @Field({ nullable: true })
    @MinLength(5)
    password?: string;
}
