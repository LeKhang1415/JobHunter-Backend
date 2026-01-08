import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}
  async findByName(name: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { name },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException(`Không tìm thấy role ${name}`);
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
