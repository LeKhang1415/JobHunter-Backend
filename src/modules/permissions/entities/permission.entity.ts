import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  Unique,
} from 'typeorm';
import { HttpMethod } from '../enums/http-method.permission';
import { Role } from 'src/modules/role/entities/role.entity';

@Entity('permissions')
@Unique(['apiPath', 'method'])
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ name: 'api_path' })
  apiPath: string;

  @Column({
    type: 'enum',
    enum: HttpMethod,
  })
  method: HttpMethod;

  @Column()
  module: string;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}
