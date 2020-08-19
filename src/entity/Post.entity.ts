import { Field, GraphQLISODateTime, ID, Int, ObjectType } from "type-graphql";
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    RelationCount,
    UpdateDateColumn,
} from "typeorm";
import { Comment } from "./Comment.entity";
import { User } from "./User.entity";

@ObjectType()
@Entity()
export class Post extends BaseEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column()
    title: string;

    @Field()
    @Column()
    body: string;

    @Field()
    @Column()
    image: string;

    @Field(() => User)
    @ManyToOne(() => User, (user) => user.posts)
    author: User;

    @ManyToMany(() => User, (user) => user.liked)
    @JoinTable()
    likes: User[];

    @Field(() => Int, { nullable: true })
    @RelationCount<Post>((post) => post.likes)
    likesCount: number;

    @Field(() => [Comment])
    @OneToMany(() => Comment, (comment) => comment.post, {
        onDelete: "CASCADE",
    })
    comments: Comment[];

    @Field(() => Int, { nullable: true })
    @RelationCount<Post>((post) => post.comments)
    commentsCount: number;

    @Field(() => GraphQLISODateTime)
    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;

    @Field(() => GraphQLISODateTime)
    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: Date;
}
