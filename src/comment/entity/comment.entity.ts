import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Tree,
  TreeParent,
  TreeChildren,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { UserEntity } from '../../user/entity/user.entity';

@Tree('materialized-path')
@Entity({ name: 'comments' })
export class CommentEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ default: 0 })
  rating: number;

  @Column({ nullable: true })
  file: string;

  @Column({ nullable: true })
  homePage: string;

  @ManyToOne(() => UserEntity, (user) => user.comments, { onDelete: 'CASCADE' })
  author: UserEntity;

  @Column()
  text: string;

  @TreeParent()
  parent: CommentEntity;

  @TreeChildren()
  children: CommentEntity[];

  @ManyToMany(() => UserEntity, { cascade: true, onDelete: 'CASCADE' })
  @JoinTable()
  ratingUp: UserEntity[];

  @ManyToMany(() => UserEntity, { cascade: true, onDelete: 'CASCADE' })
  @JoinTable()
  ratingDown: UserEntity[];
}
