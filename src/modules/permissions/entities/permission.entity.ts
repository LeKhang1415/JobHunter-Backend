// src/modules/permission/entities/permission.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  Unique,
} from 'typeorm';
import { HttpMethod } from '../enums/http-method.permission';
import { Role } from 'src/modules/roles/entities/role.entity';

@Entity('permissions')
@Unique(['apiPath', 'method'])
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; // USER_READ, USER_CREATE,...

  @Column({ name: 'api_path' })
  apiPath: string; // /users, /users/:id

  @Column({
    type: 'enum',
    enum: HttpMethod,
  })
  method: HttpMethod;

  @Column()
  module: string; // USER, ROLE, PERMISSION

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}
