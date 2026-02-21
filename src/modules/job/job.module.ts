import { Module } from '@nestjs/common';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { SkillsModule } from '../skills/skills.module';
import { CompanyModule } from '../company/company.module';
import { UsersModule } from '../users/users.module';

@Module({
  controllers: [JobController],
  providers: [JobService],
  imports: [SkillsModule, CompanyModule, UsersModule],
  exports: [JobService],
})
export class JobModule {}
