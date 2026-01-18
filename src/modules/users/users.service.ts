import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../role/entities/role.entity';
import { Company } from '../company/entities/company.entity';
import { UploadService } from '../upload/upload.service';
import { HashingProvider } from '../auth/providers/hashing.provider';
import { CreateUserDto } from './dtos/create-user.dto';
import { RoleService } from '../role/role.service';
import { CompanyService } from '../company/company.service';
import { UpdateUserDto } from './dtos/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @Inject(HashingProvider)
    private readonly hashingProvider: HashingProvider,

    private readonly uploadService: UploadService,

    private readonly roleService: RoleService,

    private readonly companyService: CompanyService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    if (await this.existsByEmail(createUserDto.email)) {
      throw new BadRequestException('Email đã tồn tại');
    }

    const hashedPassword = await this.hashingProvider.hashPassword(
      createUserDto.password,
    );

    const user = this.usersRepository.create({
      email: createUserDto.email.trim(),
      name: createUserDto.name,
      password: hashedPassword,
      address: createUserDto.address,
      gender: createUserDto.gender,
    });

    if (createUserDto.role) {
      await this.setRole(user, createUserDto.role);
    }

    if (createUserDto.company) {
      await this.setCompany(user, createUserDto.company);
    }

    return this.usersRepository.save(user);
  }

  async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['role', 'company'],
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    if (updateUserDto.name !== undefined) {
      user.name = updateUserDto.name;
    }

    if (updateUserDto.address !== undefined) {
      user.address = updateUserDto.address;
    }

    if (updateUserDto.gender !== undefined) {
      user.gender = updateUserDto.gender;
    }

    if (updateUserDto.role) {
      await this.setRole(user, updateUserDto.role);
    }

    if (updateUserDto.company) {
      await this.setCompany(user, updateUserDto.company);
    }

    if (updateUserDto.password) {
      user.password = await this.hashingProvider.hashPassword(
        updateUserDto.password,
      );
    }

    return this.usersRepository.save(user);
  }

  async existsByEmail(email: string): Promise<boolean> {
    const existsUser = await this.usersRepository.findOne({
      where: { email },
      relations: ['role'],
    });

    if (existsUser) {
      return true;
    } else {
      return false;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: { email },
      relations: ['role'],
    });
  }

  private async setCompany(user: User, id: string) {
    const company = await this.companyService.findById(id);
    user.company = company;
  }

  private async setRole(user: User, id: string) {
    const role = await this.roleService.findById(id);
    user.role = role;
  }
  async updateSelfAvatar(email: string, file: Express.Multer.File) {
    if (!file) return;

    const user = await this.findByEmail(email);

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    const result = await this.uploadService.uploadImage(file, 'avatars');

    user.userImgUrl = result.secure_url;
    await this.usersRepository.save(user);
  }
}
