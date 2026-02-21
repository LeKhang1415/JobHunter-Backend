import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateJobDto } from './dtos/create-job.dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { UsersService } from '../users/users.service';
import { SkillsService } from '../skills/skills.service';
import { CompanyService } from '../company/company.service';
import { Job } from './entities/job.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from '../company/entities/company.entity';
import { JobResponseDto } from './dtos/job-response.dto';

@Injectable()
export class JobService {
  constructor(
    private readonly usersService: UsersService,

    private readonly skillsService: SkillsService,

    private readonly companyService: CompanyService,

    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
  ) {}
  async create(
    createJobDto: CreateJobDto,
    isRecruiter: boolean,
    user: JwtPayload,
  ): Promise<JobResponseDto> {
    if (new Date(createJobDto.startDate) >= new Date(createJobDto.endDate)) {
      throw new BadRequestException('Ngày bắt đầu phải nhỏ hơn kết thúc');
    }
    let job = this.jobRepository.create({
      name: createJobDto.name,
      location: createJobDto.location,
      salary: createJobDto.salary,
      quantity: createJobDto.quantity,
      level: createJobDto.level,
      description: createJobDto.description,
      startDate: createJobDto.startDate,
      endDate: createJobDto.endDate,
      active: createJobDto.active,
    });
    if (isRecruiter) {
      const existsUser = await this.usersService.findByEmail(user.email);

      if (!existsUser) throw new NotFoundException('Không tìm thấy người dùng');

      if (existsUser.company === null) {
        throw new NotFoundException('Không thấy công ty người dùng');
      }
      job.company = existsUser.company;
    } else {
      if (createJobDto.companyId) {
        const company = await this.companyService.findById(
          createJobDto.companyId,
        );

        if (!company) {
          throw new NotFoundException('Không thấy công ty người dùng');
        }

        job.company = company;
      }
    }

    if (createJobDto.skillIds && createJobDto.skillIds.length > 0) {
      const skills = await this.skillsService.findAllById(
        createJobDto.skillIds,
      );

      if (skills?.length !== createJobDto.skillIds.length) {
        throw new NotFoundException('Skill không tồn tại');
      }

      job.skills = skills;
    }
    const savedJob = await this.jobRepository.save(job);

    return this.mapToResponseDto(savedJob);
  }

  private mapToResponseDto(job: Job): JobResponseDto {
    return {
      id: job.id,
      name: job.name,
      location: job.location,
      salary: Number(job.salary),
      quantity: job.quantity,
      level: job.level,
      description: job.description,
      startDate: job.startDate.toISOString(),
      endDate: job.endDate.toISOString(),
      active: job.active,

      company: job.company
        ? {
            id: job.company.id,
            name: job.company.name,
          }
        : null,

      skills: job.skills
        ? job.skills.map((skill) => ({
            id: skill.id,
            name: skill.name,
          }))
        : [],
    };
  }
}
