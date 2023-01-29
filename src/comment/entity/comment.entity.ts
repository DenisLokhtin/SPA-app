import {
    Entity, Column,
    PrimaryGeneratedColumn, Tree,
    ManyToOne,

    TreeParent, TreeChildren
} from 'typeorm';
import {UserEntity} from "../../user/entity/user.entity";

@Tree('materialized-path')
@Entity({name: 'comments'})
export class CommentEntity {
    @PrimaryGeneratedColumn({type: 'int'})
    id: number;

    @ManyToOne(() => UserEntity, (user) => user.comments, {
        onDelete: 'CASCADE',
    })
    author: UserEntity;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({default: 0})
    rating: number;

    @Column()
    text: string;

    @TreeParent()
    parent: CommentEntity;

    @TreeChildren()
    children: CommentEntity[];
}