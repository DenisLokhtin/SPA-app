import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Tree,
  TreeParent,
  TreeChildren,
} from 'typeorm';

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

  @Column()
  userName: string;

  @Column()
  email: string;

  @Column()
  text: string;

  @TreeParent()
  parent: CommentEntity;

  @TreeChildren()
  children: CommentEntity[];
}
