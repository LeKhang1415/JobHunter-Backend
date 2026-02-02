import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Skill } from '../../skills/entities/skill.entity';

@Entity('subscribers')
export class Subscriber {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @ManyToMany(() => Skill, (skill) => skill.subscribers, {
    cascade: true,
  })
  skills: Skill[];
}
