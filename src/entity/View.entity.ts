import {
    BaseEntity,
    Column,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryColumn,
} from "typeorm";
import { User } from "./User.entity";

@Entity()
export class View extends BaseEntity {
    @PrimaryColumn()
    @OneToOne(() => User)
    @JoinColumn({ name: "userId" })
    userId: number;

    @Column({ type: "jsonb", default: "[0]" })
    postIds: number[];
}
