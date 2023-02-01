import {
  BeforeInsert,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { hash } from 'bcrypt';
import { CommentEntity } from '../../comment/entity/comment.entity';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  userName: string;

  @Column()
  password?: string;

  @OneToMany(() => CommentEntity, (comment) => comment.author)
  comments: CommentEntity[];

  @Column({ nullable: true })
  access_token: string;

  @BeforeInsert()
  async hashPassword() {
    if (this.password) this.password = await hash(this.password, 10);
  }
}
