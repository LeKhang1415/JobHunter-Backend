import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async existsByEmail(email: string): Promise<boolean> {
    const existsUser = await this.usersRepository.findOne({
      where: { email },
    });

    if (existsUser) {
      return true;
    } else {
      return false;
    }
  }
}
