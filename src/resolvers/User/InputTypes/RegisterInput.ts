import { IsEmail, Length, MinLength } from "class-validator";
import { Field, InputType } from "type-graphql";

@InputType()
export class RegisterInput {
    @Field()
    @Length(1, 255)
    firstName: string;

    @Field()
    @Length(1, 255)
    lastName: string;

    @Field()
    @Length(8, 255)
    userName: string;

    @Field()
    @IsEmail()
    email: string;

    @Field()
    @MinLength(5)
    password: string;
}
