import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePermissionDto } from './dtos/create-permission.dto';
import { DataSource, FindOptionsWhere, In, Like, Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdatePermissionDto } from './dtos/update-permission.dto';
import { Role } from '../role/entities/role.entity';
import { PaginationProvider } from 'src/common/pagination/providers/pagination.provider';
import { Paginated } from 'src/common/pagination/interfaces/paginated.interface';
import { PermissionResponseDto } from './dtos/permission-response.dto';
import { PermissionPaginationQueryDto } from './dtos/permission-pagination-query.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,

    private readonly paginationProvider: PaginationProvider,

    private readonly dataSource: DataSource,
  ) {}
  async create(
    createPermissionDto: CreatePermissionDto,
  ): Promise<PermissionResponseDto> {
    const existing = await this.permissionRepository.findOne({
      where: {
        apiPath: createPermissionDto.apiPath,
        method: createPermissionDto.method,
      },
    });
    if (existing) {
      throw new BadRequestException('Permission đã tồn tại');
    }
    const existed = await this.findByName(createPermissionDto.name);
    if (existed) {
      throw new BadRequestException('Permission đã tồn tại');
    }
    const permission = this.permissionRepository.create(createPermissionDto);
    const saved = await this.permissionRepository.save(permission);

    return this.mapToPermissionResponseDto(saved);
  }

  async update(
    id: string,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<PermissionResponseDto> {
    const permission = await this.findById(id);

    if (!permission) {
      throw new NotFoundException('Permission không tồn tại');
    }
    if (
      updatePermissionDto.name &&
      updatePermissionDto.name !== permission.name
    ) {
      const existed = await this.findByName(updatePermissionDto.name);
      if (existed) {
        throw new BadRequestException('Permission đã tồn tại');
      }
    }

    Object.assign(permission, updatePermissionDto);
    const updated = await this.permissionRepository.save(permission);

    return this.mapToPermissionResponseDto(updated);
  }

  async delete(id: string): Promise<{ name: string }> {
    const permission = await this.findById(id);

    if (!permission) {
      throw new NotFoundException('Permission không tồn tại');
    }

    try {
      await this.dataSource.transaction(async (manager) => {
        for (const role of permission.roles) {
          role.permissions = role.permissions.filter(
            (p) => p.id !== permission.id,
          );
          await manager.getRepository(Role).save(role);
        }

        await manager.getRepository(Permission).remove(permission);
      });
    } catch {
      throw new BadRequestException('Xóa permission thất bại');
    }

    return {
      name: permission.name,
    };
  }

  async findAllPermission(
    permissionPagination: PermissionPaginationQueryDto,
  ): Promise<Paginated<PermissionResponseDto>> {
    const { name, apiPath, ...pagination } = permissionPagination;

    const where: FindOptionsWhere<Permission> = {};

    if (name) {
      where.name = Like(`%${name}%`);
    }

    if (apiPath) {
      where.apiPath = Like(`%${apiPath}%`);
    }

    const paginated = await this.paginationProvider.paginateQuery(
      pagination,
      this.permissionRepository,
      where,
    );

    return {
      data: paginated.data.map((p) => this.mapToPermissionResponseDto(p)),
      meta: paginated.meta,
    };
  }

  async findAllWithoutPagination(): Promise<PermissionResponseDto[]> {
    const permissions = await this.permissionRepository.find({
      relations: ['roles'],
    });

    return permissions.map((p) => this.mapToPermissionResponseDto(p));
  }

  async findAllById(permissionIds: string[]): Promise<Permission[]> {
    return await this.permissionRepository.find({
      where: { id: In(permissionIds) },
    });
  }

  async findByRoleId(roleId: string): Promise<PermissionResponseDto[]> {
    const permissions = await this.permissionRepository.find({
      where: {
        roles: {
          id: roleId,
        },
      },
    });

    return permissions.map((p) => this.mapToPermissionResponseDto(p));
  }

  async findByName(name: string): Promise<Permission | null> {
    return await this.permissionRepository.findOne({
      where: { name },
      relations: ['roles'],
    });
  }

  async findById(id: string): Promise<Permission | null> {
    return await this.permissionRepository.findOne({
      where: { id },
      relations: ['roles'],
    });
  }

  private mapToPermissionResponseDto(
    permission: Permission,
  ): PermissionResponseDto {
    return {
      id: permission.id,
      name: permission.name,
      apiPath: permission.apiPath,
      method: permission.method,
      module: permission.module,
      createdAt: permission.createdAt.toISOString(),
      updatedAt: permission.updatedAt.toISOString(),
    };
  }
}
