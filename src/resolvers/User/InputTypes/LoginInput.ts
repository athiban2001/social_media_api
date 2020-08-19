import { MinLength } from "class-validator";
import { Field, InputType } from "type-graphql";
import { isEmailOrUserName } from "../../../types/decorators/emailOrUsername";

@InputType()
export class LoginInput {
    @Field()
    @isEmailOrUserName({
        message: "emailOrUsername field is neither a email nor a userName",
    })
    emailOrUsername: string;

    @Field()
    @MinLength(5)
    password: string;
}
