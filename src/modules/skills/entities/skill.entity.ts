import { Job } from 'src/modules/job/entities/job.entity';
import { Subscriber } from 'src/modules/subscribers/entities/subscriber.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('skills')
export class Skill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @ManyToMany(() => Job, (job) => job.skills)
  jobs: Job[];

  @ManyToMany(() => Subscriber, (subscriber) => subscriber.skills)
  subscribers: Subscriber[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
