import { Field, GraphQLISODateTime, ID, ObjectType } from "type-graphql";
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { Post } from "./Post.entity";
import { User } from "./User.entity";

@Entity()
@ObjectType()
export class Comment extends BaseEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column()
    text: string;

    @Field(() => User)
    @ManyToOne(() => User, (user) => user.comments)
    author: User;

    @Field(() => Post)
    @ManyToOne(() => Post, (post) => post.comments)
    post: Post;

    @Field(() => GraphQLISODateTime)
    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;

    @Field(() => GraphQLISODateTime)
    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: Date;
}
