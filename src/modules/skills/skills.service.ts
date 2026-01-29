import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Skill } from './entities/skill.entity';
import { CreateSkillDto } from './dtos/create-skill.dto';
import { SkillResponseDto } from './dtos/skill-response.dto';
import { UpdateSkillDto } from './dtos/update-skill.dto';
import { PaginationQueryDto } from 'src/common/pagination/dtos/pagination-query.dto';
import { Paginated } from 'src/common/pagination/interfaces/paginated.interface';
import { PaginationProvider } from 'src/common/pagination/providers/pagination.provider';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillRepository: Repository<Skill>,

    private readonly paginationProvider: PaginationProvider,
  ) {}

  async create(createSkillDto: CreateSkillDto): Promise<SkillResponseDto> {
    const exists = await this.skillRepository.exists({
      where: { name: createSkillDto.name },
    });

    if (exists) {
      throw new ConflictException('Kỹ năng này đã tồn tại');
    }

    const skill = this.skillRepository.create({
      name: createSkillDto.name,
    });

    const savedSkill = await this.skillRepository.save(skill);
    return this.mapToResponseDto(savedSkill);
  }

  async update(
    id: string,
    updateSkillDto: UpdateSkillDto,
  ): Promise<SkillResponseDto> {
    const skill = await this.skillRepository.findOne({
      where: { id: id },
    });

    if (!skill) {
      throw new NotFoundException('Không tìm thấy kỹ năng');
    }

    const exists = await this.skillRepository
      .createQueryBuilder('skill')
      .where('skill.name = :name', { name: updateSkillDto.name })
      .andWhere('skill.id != :id', { id })
      .getExists();

    if (exists) {
      throw new ConflictException('Kỹ năng này đã tồn tại');
    }

    skill.name = updateSkillDto.name;

    const savedSkill = await this.skillRepository.save(skill);

    return this.mapToResponseDto(savedSkill);
  }

  async findById(id: string): Promise<SkillResponseDto> {
    const skill = await this.skillRepository.findOne({
      where: { id },
    });

    if (!skill) {
      throw new NotFoundException('Không tìm thấy kỹ năng');
    }

    return this.mapToResponseDto(skill);
  }

  async findAllSkills(
    pagination: PaginationQueryDto,
  ): Promise<Paginated<SkillResponseDto>> {
    const paginated = await this.paginationProvider.paginateQuery(
      pagination,
      this.skillRepository,
    );

    return {
      data: paginated.data.map((skill) => this.mapToResponseDto(skill)),
      meta: paginated.meta,
    };
  }

  async findAllWithoutPagination(): Promise<Skill[]> {
    return this.skillRepository.find({
      order: { name: 'ASC' },
    });
  }

  async delete(id: string): Promise<SkillResponseDto> {
    const skill = await this.skillRepository.findOne({
      where: { id },
    });

    if (!skill) {
      throw new NotFoundException('Không tìm thấy kỹ năng');
    }

    await this.skillRepository.remove(skill);
    return this.mapToResponseDto(skill);
  }

  private mapToResponseDto(skill: Skill): SkillResponseDto {
    return {
      id: skill.id,
      name: skill.name,
      createdAt: skill.createdAt.toISOString(),
      updatedAt: skill.updatedAt.toISOString(),
    };
  }
}
