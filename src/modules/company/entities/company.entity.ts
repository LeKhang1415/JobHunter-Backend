import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { CompanyLogo } from './company-logo.entity';
import { Job } from 'src/modules/job/entities/job.entity';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  address: string;

  @OneToOne(() => CompanyLogo, (logo) => logo.company, { cascade: true })
  companyLogo: CompanyLogo;

  @OneToMany(() => User, (user) => user.company)
  users: User[];

  @OneToMany(() => Job, (job) => job.company, { cascade: true })
  jobs: Job[];

  @OneToOne(() => User)
  @JoinColumn({ name: 'owner_id' })
  owner: User;
}
