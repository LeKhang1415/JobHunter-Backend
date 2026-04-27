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
import { JobResponseDto } from './dtos/job-response.dto';
import { UploadService } from '../upload/upload.service';
import { UpdateJobDto } from './dtos/update-job.dto';
import { JobPaginationQueryDto } from './dtos/job-pagination-query.dto';
import { PaginationProvider } from 'src/common/pagination/providers/pagination.provider';

@Injectable()
export class JobService {
  constructor(
    private readonly usersService: UsersService,

    private readonly skillsService: SkillsService,

    private readonly companyService: CompanyService,

    private readonly uploadService: UploadService,

    private readonly paginationProvider: PaginationProvider,

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

  async update(
    id: string,
    updateJobDto: UpdateJobDto,
    isRecruiter: boolean,
    user: JwtPayload,
  ): Promise<JobResponseDto> {
    const job = await this.jobRepository.findOne({
      where: { id },
      relations: ['company', 'skills'],
    });

    if (!job) {
      throw new NotFoundException('Không tìm thấy công việc');
    }

    const startDate = updateJobDto.startDate ?? job.startDate;
    const endDate = updateJobDto.endDate ?? job.endDate;

    if (new Date(startDate) >= new Date(endDate)) {
      throw new BadRequestException('Ngày bắt đầu phải nhỏ hơn ngày kết thúc');
    }

    const { companyId, skillIds, ...jobUpdates } = updateJobDto;

    Object.assign(job, jobUpdates);

    if (isRecruiter) {
      const existsUser = await this.usersService.findByEmail(user.email);

      if (!existsUser) throw new NotFoundException('Không tìm thấy người dùng');
      if (!existsUser.company)
        throw new NotFoundException('Không thấy công ty');

      if (existsUser.company.id !== job.company.id) {
        throw new BadRequestException('Không có quyền chỉnh sửa');
      }
    }

    if (!isRecruiter && companyId) {
      const company = await this.companyService.findById(companyId);
      if (!company) throw new NotFoundException('Công ty không tồn tại');
      job.company = company;
    }

    if (skillIds) {
      const skills = await this.skillsService.findAllById(skillIds);

      if (skills?.length !== skillIds.length) {
        throw new NotFoundException('Skill không tồn tại');
      }

      job.skills = skills;
    }

    const updated = await this.jobRepository.save(job);

    return this.mapToResponseDto(updated);
  }

  async delete(id: string): Promise<JobResponseDto> {
    const job = await this.jobRepository.findOne({
      where: { id },
      relations: ['skills', 'resumes'],
    });

    if (!job) {
      throw new NotFoundException('Không tìm thấy công việc');
    }

    await this.cleanupJob(job);

    await this.jobRepository.remove(job);

    return this.mapToResponseDto(job);
  }

  async deleteForRecruiter(
    id: string,
    user: JwtPayload,
  ): Promise<JobResponseDto> {
    const existsUser = await this.usersService.findByEmail(user.email);

    if (!existsUser) throw new NotFoundException('Không tìm thấy người dùng');

    if (!existsUser.company) {
      throw new NotFoundException('Không tìm thấy công ty');
    }

    const job = await this.jobRepository.findOne({
      where: { id },
      relations: ['company', 'skills', 'resumes'],
    });

    if (!job) {
      throw new NotFoundException('Không tìm thấy công việc');
    }

    if (job.company.id !== existsUser.company.id) {
      throw new BadRequestException('Không có quyền xóa');
    }

    await this.cleanupJob(job);

    await this.jobRepository.remove(job);

    return this.mapToResponseDto(job);
  }

  async findById(id: string): Promise<JobResponseDto> {
    const job = await this.jobRepository.findOne({
      where: { id },
      relations: ['company', 'skills'],
    });

    if (!job) {
      throw new NotFoundException('Không tìm thấy công việc');
    }

    return this.mapToResponseDto(job);
  }

  async findAll(query: JobPaginationQueryDto) {
    const { name, companyName, level, location } = query;

    const queryBuilder = this.jobRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.company', 'company')
      .leftJoinAndSelect('company.companyLogo', 'companyLogo')
      .leftJoinAndSelect('job.skills', 'skills')
      .where('job.active = :active', { active: true });

    if (name) {
      queryBuilder.andWhere('job.name ILIKE :name', { name: `%${name}%` });
    }

    if (location) {
      queryBuilder.andWhere('job.location ILIKE :location', {
        location: `%${location}%`,
      });
    }

    if (level && level !== 'all') {
      queryBuilder.andWhere('job.level = :level', { level });
    }

    if (companyName) {
      queryBuilder.andWhere('company.name ILIKE :companyName', {
        companyName: `%${companyName}%`,
      });
    }

    const paginatedResult = await this.paginationProvider.paginateQueryBuilder(
      query,
      queryBuilder,
    );

    return {
      ...paginatedResult,
      data: paginatedResult.data.map((job) => this.mapToResponseDto(job)),
    };
  }

  async findAllJobsForRecruiterCompany(
    query: JobPaginationQueryDto,
    user: JwtPayload,
  ) {
    const existsUser = await this.usersService.findByEmail(user.email);

    if (!existsUser) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    if (!existsUser.company) {
      throw new NotFoundException(
        'Tài khoản của bạn chưa được liên kết với công ty nào',
      );
    }

    const { name, level, location } = query;

    const queryBuilder = this.jobRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.company', 'company')
      .leftJoinAndSelect('company.companyLogo', 'companyLogo')
      .leftJoinAndSelect('job.skills', 'skills')
      .where('company.id = :companyId', { companyId: existsUser.company.id });

    if (name) {
      queryBuilder.andWhere('job.name ILIKE :name', { name: `%${name}%` });
    }

    if (location) {
      queryBuilder.andWhere('job.location ILIKE :location', {
        location: `%${location}%`,
      });
    }

    if (level && level !== 'all') {
      queryBuilder.andWhere('job.level = :level', { level });
    }

    const paginatedResult = await this.paginationProvider.paginateQueryBuilder(
      query,
      queryBuilder,
    );

    return {
      ...paginatedResult,
      data: paginatedResult.data.map((job) => this.mapToResponseDto(job)),
    };
  }

  async findByCompanyId(companyId: string): Promise<JobResponseDto[]> {
    const jobs = await this.jobRepository.find({
      where: {
        company: { id: companyId },
      },
      relations: ['company', 'skills'],
    });

    return jobs.map((job) => {
      const dto = this.mapToResponseDto(job);
      dto.description = null;
      dto.company = null;
      return dto;
    });
  }

  private async cleanupJob(job: Job) {
    job.skills = [];

    if (job.resumes?.length) {
      for (const resume of job.resumes) {
        if (resume.publicId) {
          await this.uploadService.deletePDF(resume.publicId, 'resumes');
        }
      }
    }
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
            address: job.company.address,
            logoUrl: job.company.companyLogo.logoUrl,
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
