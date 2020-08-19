import { registerEnumType } from "type-graphql";

export enum sortOrder {
    ASC = "ASC",
    DESC = "DESC",
}

export enum sortBy {
    CREATION_DATE = "createdAt",
    LIKES_COUNT = "likesCount",
    COMMENTS_COUNT = "commentsCount",
}

registerEnumType(sortOrder, {
    name: "sortOrder",
    description: "Describe the order ascending or descending",
});

registerEnumType(sortBy, {
    name: "sortBy",
    description: "Describe by which the sorting needs to occur",
});
