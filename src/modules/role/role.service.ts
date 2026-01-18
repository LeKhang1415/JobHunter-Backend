import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';
import { CreateRoleDto } from './dtos/create-role.dto';
import { PermissionsService } from '../permissions/permissions.service';
import { Permission } from '../permissions/entities/permission.entity';
import { UpdateRoleDto } from './dtos/update-role.dto';
import { RoleEnum } from 'src/common/enums/role.enum';
import { PaginationQueryDto } from 'src/common/pagination/dtos/pagination-query.dto';
import { Paginated } from 'src/common/pagination/interfaces/paginated.interface';
import { PaginationProvider } from 'src/common/pagination/providers/pagination.provider';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

    private readonly permissionsService: PermissionsService,

    private readonly paginationProvider: PaginationProvider,
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    const { name, description, active, permissionIds } = createRoleDto;

    const exists = await this.findByName(name);

    if (exists) {
      throw new BadRequestException('Role đã tồn tại');
    }

    const normalizedName = name.trim().toUpperCase();

    let role = this.roleRepository.create({
      name: normalizedName,
      description,
      active,
    });
    let permissions: Permission[] = [];

    if (permissionIds && permissionIds.length !== 0) {
      permissions = await this.permissionsService.findAllById(permissionIds);

      if (permissions.length !== permissionIds.length) {
        throw new BadRequestException('Có permission không tồn tại');
      }
    }

    role.permissions = permissions;

    return await this.roleRepository.save(role);
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
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

    return await this.roleRepository.save(role);
  }

  async findAllRole(pagination: PaginationQueryDto): Promise<Paginated<Role>> {
    return await this.paginationProvider.paginateQuery(
      pagination,
      this.roleRepository,
    );
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
}
