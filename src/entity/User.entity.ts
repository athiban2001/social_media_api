import { Field, ID, Int, ObjectType } from "type-graphql";
import {
    BaseEntity,
    Column,
    Entity,
    JoinTable,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn,
    RelationCount,
} from "typeorm";
import { Comment } from "./Comment.entity";
import { Post } from "./Post.entity";

@Entity()
@ObjectType()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    @Field(() => ID)
    id: number;

    @Field()
    @Column()
    firstName: string;

    @Field()
    @Column()
    lastName: string;

    @Field()
    @Column("text", { unique: true })
    userName: string;

    @Field()
    @Column("text", { unique: true })
    email: string;

    @Field()
    @Column("text", { default: "Male" })
    gender: "Male" | "Female";

    @Field()
    @Column("text", {
        default: `/db/user/default`,
    })
    profilePicture: string;

    @Field(() => [Post])
    @OneToMany(() => Post, (post) => post.author, { onDelete: "CASCADE" })
    posts: Post[];

    @Field(() => [Comment])
    @OneToMany(() => Comment, (comment) => comment.author, {
        onDelete: "CASCADE",
    })
    comments: Comment[];

    @Field(() => Int, { nullable: true })
    @RelationCount<User>((user) => user.followers)
    followersCount: number;

    @Field(() => Int, { nullable: true })
    @RelationCount<User>((user) => user.following)
    followingCount: number;

    @ManyToMany(() => User, (user) => user.following)
    @JoinTable()
    followers: User[];

    @ManyToMany(() => User, (user) => user.followers)
    following: User[];

    @ManyToMany(() => Post, (post) => post.likes)
    liked: Post[];

    @Column()
    password: string;
}
