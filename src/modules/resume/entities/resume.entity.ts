// resume.entity.ts
import { ResumeStatus } from 'src/common/enums/resume-status.enum';
import { Job } from 'src/modules/job/entities/job.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity('resumes')
export class Resume {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  fileKey: string;

  @Column({ type: 'enum', enum: ResumeStatus })
  status: ResumeStatus;

  @ManyToOne(() => User, (user) => user.resumes)
  user: User;

  @ManyToOne(() => Job, (job) => job.resumes)
  job: Job;

  @Column()
  version: number;
}
