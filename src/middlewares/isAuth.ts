import { MiddlewareFn } from "type-graphql";
import { ContextType } from "./../types/interfaces/ContextType";

export const isAuth: MiddlewareFn<ContextType> = ({ context }, next) => {
    if (!context.req.session!.userId) {
        throw new Error("Not authenticated to access the fields");
    }

    return next();
};
