import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { RegisterUser } from './dtos/register-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service';
import { BcryptProvider } from './providers/bcrypt.provider';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { RoleService } from '../role/role.service';
import { RoleEnum } from 'src/common/enums/role.enum';

@Injectable()
export class AuthService {
  constructor(
    @Inject()
    private readonly usersService: UsersService,

    @Inject()
    private readonly roleService: RoleService,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    private readonly bcryptProvider: BcryptProvider,
  ) {}
  async register(registerUser: RegisterUser) {
    const { email, name, password, gender, address, recruiter } = registerUser;
    if (await this.usersService.existsByEmail(email)) {
      throw new BadRequestException('Email đã tồn tại');
    }
    const hashedPassword = await this.bcryptProvider.hashPassword(password);

    const newUser = this.usersRepository.create({
      email,
      name,
      password: hashedPassword,
      gender,
      address,
    });

    const role = recruiter
      ? await this.roleService.findByName(RoleEnum.RECRUITER)
      : await this.roleService.findByName(RoleEnum.USER);

    newUser.role = role;

    const savedUser = await this.usersRepository.save(newUser);

    return {
      id: savedUser.id,
      email: savedUser.email,
      name: savedUser.name,
      role: savedUser.role.name,
    };
  }
}
