import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';
import { CreateRoleDto } from './dtos/create-role.dto';
import { PermissionsService } from '../permissions/permissions.service';

import { UpdateRoleDto } from './dtos/update-role.dto';
import { RoleEnum } from 'src/common/enums/role.enum';
import { PaginationQueryDto } from 'src/common/pagination/dtos/pagination-query.dto';
import { Paginated } from 'src/common/pagination/interfaces/paginated.interface';
import { PaginationProvider } from 'src/common/pagination/providers/pagination.provider';
import { RoleResponseDto } from './dtos/role-response.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

    private readonly permissionsService: PermissionsService,

    private readonly paginationProvider: PaginationProvider,

    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<RoleResponseDto> {
    const { name, description, active, permissionIds } = createRoleDto;
    const normalizedName = name.trim().toUpperCase();

    const exists = await this.roleRepository.findOne({
      where: { name: normalizedName },
    });

    if (exists) {
      throw new BadRequestException('Role đã tồn tại');
    }

    const newRole = this.roleRepository.create({
      name: normalizedName,
      description,
      active,
    });

    if (permissionIds && permissionIds.length > 0) {
      const permissions =
        await this.permissionsService.findAllById(permissionIds);

      if (permissions.length !== permissionIds.length) {
        throw new BadRequestException('Có permission không tồn tại');
      }
      newRole.permissions = permissions;
    }

    const saved = await this.roleRepository.save(newRole);

    return this.mapToRoleResponseDto(saved);
  }
  async update(
    id: string,
    updateRoleDto: UpdateRoleDto,
  ): Promise<RoleResponseDto> {
    const { name, description, active, permissionIds } = updateRoleDto;

    const role = await this.findById(id);

    if (name && role.name !== RoleEnum.ADMIN && role.name !== RoleEnum.USER) {
      role.name = name.trim().toUpperCase();
    }

    if (description) role.description = description;
    if (active !== undefined) {
      role.active = active;
    }

    if (permissionIds) {
      const requestedPermissions =
        await this.permissionsService.findAllById(permissionIds);

      if (requestedPermissions.length !== permissionIds.length) {
        throw new BadRequestException('Có permission không tồn tại');
      }

      role.permissions = requestedPermissions;
    }
    const updated = await this.roleRepository.save(role);

    return this.mapToRoleResponseDto(updated);
  }

  async findAllRole(
    pagination: PaginationQueryDto,
  ): Promise<Paginated<RoleResponseDto>> {
    const paginated = await this.paginationProvider.paginateQuery(
      pagination,
      this.roleRepository,
    );

    return {
      data: paginated.data.map((role) => this.mapToRoleResponseDto(role)),
      meta: paginated.meta,
    };
  }

  async findByName(name: string): Promise<Role> {
    const normalized = name.trim().toUpperCase();
    const role = await this.roleRepository.findOne({
      where: { name: normalized },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException(`Không tìm thấy role ${name}`);
    }
    return role;
  }

  async findById(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException('Không tìm thấy chức vụ');
    }

    return role;
  }

  async getPermissionByName(name: string): Promise<string[]> {
    const role = await this.findByName(name);

    let permissions: string[] = [];
    role.permissions.forEach((permission) =>
      permissions.push(`${permission.method} ${permission.apiPath}`),
    );

    return permissions;
  }

  async getPermissionById(id: string): Promise<string[]> {
    const role = await this.findById(id);

    let permissions: string[] = [];
    role.permissions.forEach((permission) =>
      permissions.push(`${permission.method} ${permission.apiPath}`),
    );

    return permissions;
  }

  async delete(id: string): Promise<RoleResponseDto> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException('Chức vụ không tồn tại');
    }

    const currentName = role.name;

    if (
      currentName.toUpperCase() === RoleEnum.ADMIN ||
      currentName.toUpperCase() === RoleEnum.USER
    ) {
      throw new ForbiddenException('Không thể xóa chức vụ mặc định');
    }

    const response = this.mapToRoleResponseDto(role);

    if (role.permissions && role.permissions.length > 0) {
      role.permissions = [];
      await this.roleRepository.save(role);
    }

    await this.usersService.detachUsersFromRole(role.id);

    await this.roleRepository.remove(role);

    return response;
  }

  private mapToRoleResponseDto(role: Role): RoleResponseDto {
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      active: role.active,
      createdAt: role.createdAt.toISOString(),
      updatedAt: role.updatedAt.toISOString(),
    };
  }
}
