import path from "path";
import { buildSchema } from "type-graphql";

export const createSchema = () => {
    return buildSchema({
        resolvers: [
            path.join(__dirname, "../resolvers/**/*.resolver{.js,.ts}"),
        ],
    });
};
