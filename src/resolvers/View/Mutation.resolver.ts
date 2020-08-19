import { Ctx, Mutation, Resolver, UseMiddleware } from "type-graphql";
import { View } from "../../entity/View.entity";
import { isAuth } from "../../middlewares/isAuth";
import { ContextType } from "../../types/interfaces/ContextType";

@Resolver(() => View)
export class ViewMutationResolver {
    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async clearPostsData(@Ctx() ctx: ContextType): Promise<Boolean> {
        const view = await View.findOne({
            where: { userId: ctx.req.session!.userId },
        });

        if (view) {
            view.postIds = [0];
            await view.save();

            return true;
        }

        throw new Error("Invalid User");
    }
}
