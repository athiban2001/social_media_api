import bcrypt from "bcryptjs";
import fs from "fs/promises";
import { FileUpload, GraphQLUpload } from "graphql-upload";
import path from "path";
import sharp from "sharp";
import streamToPromise from "stream-to-promise";
import { Arg, Ctx, Mutation, Resolver, UseMiddleware } from "type-graphql";
import { User } from "../../../entity/User.entity";
import { isAuth } from "../../../middlewares/isAuth";
import { ContextType } from "../../../types/interfaces/ContextType";
import { LoginInput } from "../InputTypes/LoginInput";
import { RegisterInput } from "../InputTypes/RegisterInput";
import { UpdateProfileInput } from "../InputTypes/UpdateProfileInput";

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
    async addProfilePicture(
        @Arg("profilePicture", () => GraphQLUpload) profilePicture: FileUpload,
        @Ctx() ctx: ContextType
    ): Promise<Boolean> {
        const user = await User.findOne(ctx.req.session!.userId);
        const mimeTypes: string[] = ["image/png", "image/jpeg", "image/gif"];
        if (user && mimeTypes.includes(profilePicture.mimetype)) {
            const { createReadStream } = profilePicture;
            const buffer = await streamToPromise(createReadStream());

            await sharp(buffer)
                .resize(940, 788)
                .png()
                .toFile(
                    path.join(__dirname, `../../uploads/post/${user.id}.png`)
                );
            user.profilePicture = `/db/user/${user.id}`;
            await user.save();

            return true;
        }

        throw new Error("Only jpg,png and gif images are allowed");
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async deleteProfilePicture(@Ctx() ctx: ContextType): Promise<Boolean> {
        const user = await User.findOne(ctx.req.session!.userId);
        if (user) {
            await fs.unlink(
                path.join(__dirname, `../../uploads/user/${user.id}.png`)
            );
            return true;
        }

        throw new Error("Not authenticated");
    }

    @Mutation(() => User)
    @UseMiddleware(isAuth)
    async updateProfile(
        @Arg("data") data: UpdateProfileInput,
        @Ctx() ctx: ContextType
    ): Promise<User> {
        const user = await User.findOne(ctx.req.session!.userId);
        if (user) {
            if (data.firstName) {
                user.firstName = data.firstName;
            }
            if (data.lastName) {
                user.lastName = data.lastName;
            }
            if (data.userName) {
                user.userName = data.userName;
            }
            if (data.password) {
                user.password = await bcrypt.hash(data.password, 12);
            }
            await user.save();

            return user;
        }

        throw new Error("Not Authenticated");
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async logout(@Ctx() ctx: ContextType) {
        ctx.req.session = null;
        return true;
    }
}
