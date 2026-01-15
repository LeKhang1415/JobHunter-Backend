import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePermissionDto } from './dtos/create-permission.dto';
import { In, Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdatePermissionDto } from './dtos/update-permission.dto';
import { Role } from '../role/entities/role.entity';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}
  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    const existed = await this.findByName(createPermissionDto.name);
    if (existed) {
      throw new BadRequestException('Permission đã tồn tại');
    }
    const permission = this.permissionRepository.create(createPermissionDto);
    return this.permissionRepository.save(permission);
  }

  async update(
    id: string,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<Permission> {
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
    return this.permissionRepository.save(permission);
  }

  async delete(id: string) {
    const permission = await this.findById(id);

    if (!permission) {
      throw new NotFoundException('Permission không tồn tại');
    }

    for (const role of permission.roles) {
      role.permissions = role.permissions.filter((p) => p.id != permission.id);
      await this.roleRepository.save(role);
    }

    await this.permissionRepository.remove(permission);

    return {
      name: permission.name,
    };
  }

  async findAllById(permissionIds: string[]): Promise<Permission[]> {
    return await this.permissionRepository.find({
      where: { id: In(permissionIds) },
    });
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
}
