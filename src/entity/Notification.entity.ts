import { Field, GraphQLISODateTime, ID, ObjectType } from "type-graphql";
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { Post } from "./Post.entity";
import { User } from "./User.entity";

@ObjectType()
@Entity()
export class Notification extends BaseEntity {
    @PrimaryGeneratedColumn()
    @Field(() => ID)
    id: number;

    @Column()
    payloadId: string;

    @Column()
    @Field()
    type: "LIKE" | "COMMENT" | "FOLLOWER" | "POST";

    @OneToOne(() => User)
    @JoinColumn()
    to: User;

    @OneToOne(() => User, { nullable: false })
    @JoinColumn()
    @Field(() => User)
    changer: User;

    @OneToOne(() => Post, { nullable: true })
    @JoinColumn()
    @Field(() => Post, { nullable: true })
    changed?: Post;

    @CreateDateColumn()
    @Field(() => GraphQLISODateTime)
    createdAt: Date;
}
