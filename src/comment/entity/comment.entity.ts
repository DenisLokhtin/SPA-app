import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Tree,
  TreeParent,
  TreeChildren,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { UserEntity } from '../../user/entity/user.entity';
import { RateUsersEntity } from './rateUsers.entity';

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

  @OneToMany(() => RateUsersEntity, (rateUsers) => rateUsers.comment)
  rateUsers: RateUsersEntity[];
}
