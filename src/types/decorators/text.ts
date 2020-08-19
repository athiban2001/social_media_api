import Filter from "bad-words";
import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from "class-validator";

@ValidatorConstraint({ async: true })
class textValidator implements ValidatorConstraintInterface {
    async validate(text: string) {
        const filter = new Filter();
        if (filter.isProfane(text)) {
            return false;
        }

        return true;
    }
}

export function text(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: textValidator,
        });
    };
}
