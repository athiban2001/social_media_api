import { Length } from "class-validator";
import { FileUpload, GraphQLUpload } from "graphql-upload";
import { Field, InputType } from "type-graphql";
import { isImage } from "../../../types/decorators/image";
import { text } from "../../../types/decorators/text";

@InputType()
export class CreatePostInput {
    @Field()
    @Length(1, 255)
    @text({ message: "Cannot use bad words" })
    title: string;

    @Field()
    @Length(1, 1500)
    @text({ message: "Cannot use bad words" })
    body: string;

    @Field(() => GraphQLUpload, { nullable: true })
    @isImage({ message: "Only png,jpeg and gif images are allowed" })
    postImage: FileUpload;
}
