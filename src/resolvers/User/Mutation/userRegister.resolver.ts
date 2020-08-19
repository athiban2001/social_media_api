import bcrypt from "bcryptjs";
import { Arg, Ctx, Mutation, Resolver, UseMiddleware } from "type-graphql";
import { User } from "../../../entity/User.entity";
import { isAuth } from "../../../middlewares/isAuth";
import { ContextType } from "../../../types/interfaces/ContextType";
import { LoginInput } from "../InputTypes/LoginInput";
import { RegisterInput } from "../InputTypes/RegisterInput";

@Resolver(() => User)
export class UserRegisterMutationResolver {
    @Mutation(() => User)
    async register(
        @Arg("data")
        { firstName, lastName, userName, email, password }: RegisterInput,
        @Ctx() ctx: ContextType
    ): Promise<User> {
        const newUser = await User.create({
            firstName,
            lastName,
            email,
            userName: userName.trim().toLowerCase(),
            password: await bcrypt.hash(password, 12),
        }).save();

        ctx.req.session!.userId = newUser.id;

        return newUser;
    }

    @Mutation(() => User, { nullable: true })
    async login(
        @Arg("data") { emailOrUsername, password }: LoginInput,
        @Ctx() ctx: ContextType
    ): Promise<User | null> {
        const user = await User.findOne({
            where: [{ email: emailOrUsername }, { userName: emailOrUsername }],
        });

        if (!user) {
            return null;
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return null;
        }

        ctx.req.session!.userId = user.id;
        return user;
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async logout(@Ctx() ctx: ContextType) {
        ctx.req.session = null;
        return true;
    }
}
