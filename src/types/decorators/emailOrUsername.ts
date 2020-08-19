import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from "class-validator";
import { User } from "./../../entity/User.entity";

@ValidatorConstraint({ async: true })
class loginValidator implements ValidatorConstraintInterface {
    async validate(emailOrUserName: string) {
        const user = await User.findOne({
            where: [{ email: emailOrUserName }, { userName: emailOrUserName }],
        });

        if (!user) {
            return false;
        }
        return true;
    }
}

export function isEmailOrUserName(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: loginValidator,
        });
    };
}
