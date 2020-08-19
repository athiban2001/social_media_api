import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from "class-validator";
import { FileUpload } from "graphql-upload";

@ValidatorConstraint()
class imageUpload implements ValidatorConstraintInterface {
    validate(image: FileUpload) {
        const mimeTypes: string[] = ["image/gif", "image/png", "image/jpeg"];
        if (mimeTypes.includes(image.mimetype)) {
            return true;
        }
        return false;
    }
}

export function isImage(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: imageUpload,
        });
    };
}
