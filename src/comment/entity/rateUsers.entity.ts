import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  Index,
} from 'typeorm';
import { CommentEntity } from './comment.entity';
import { UserEntity } from '../../user/entity/user.entity';
import { Max, Min } from 'class-validator';

@Entity({ name: 'rateUsers' })
@Index(['user', 'comment'], { unique: true })
export class RateUsersEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.rateUsers, {
    onDelete: 'CASCADE',
  })
  user: UserEntity;

  @ManyToOne(() => CommentEntity, (comment) => comment.rateUsers, {
    onDelete: 'CASCADE',
  })
  comment: CommentEntity;

  @Column()
  @Min(-1)
  @Max(1)
  rating: number;
}
