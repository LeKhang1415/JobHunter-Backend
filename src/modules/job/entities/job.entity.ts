import { Level } from 'src/common/enums/level.enum';
import { Company } from 'src/modules/company/entities/company.entity';
import { Resume } from 'src/modules/resume/entities/resume.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  location: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  salary: number;

  @Column()
  quantity: number;

  @Column({ type: 'enum', enum: Level })
  level: Level;

  @Column()
  description: string;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ default: true })
  active: boolean;

  @ManyToOne(() => Company, (company) => company.jobs)
  company: Company;

  @OneToMany(() => Resume, (resume) => resume.job)
  resumes: Resume[];
}
