import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Gender } from '../enums/users-gender.enum';
import { Role } from 'src/modules/roles/entities/role.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ nullable: false })
  address: string;

  @Column({ type: 'enum', enum: Gender, default: Gender.OTHER })
  gender: Gender;

  @Column()
  userImgUrl: string;

  @Column({ nullable: false })
  @Exclude()
  password: string;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'role_id' })
  role: Role;
}
