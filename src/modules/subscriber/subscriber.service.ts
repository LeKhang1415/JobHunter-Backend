import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Subscriber } from './entities/subscriber.entity';
import { Skill } from '../skills/entities/skill.entity';
import { CreateSubscriberDto } from './dtos/create-subscriber.dto';
import { UpdateSubscriberDto } from './dtos/update-subscriber.dto';
import { SubscriberResponseDto } from './dtos/subscriber-response.dto';

@Injectable()
export class SubscriberService {
  constructor(
    @InjectRepository(Subscriber)
    private readonly subscriberRepository: Repository<Subscriber>,

    @InjectRepository(Skill)
    private readonly skillRepository: Repository<Skill>,
  ) {}

  async createSelf(
    email: string,
    createSubscriberDto: CreateSubscriberDto,
  ): Promise<SubscriberResponseDto> {
    const existed = await this.subscriberRepository.findOne({
      where: { email },
    });

    if (existed) {
      throw new ConflictException('Người dùng này đã đăng ký rồi');
    }

    const subscriber = this.subscriberRepository.create({ email });

    if (createSubscriberDto.skills?.length) {
      subscriber.skills = await this.skillRepository.find({
        where: { id: In(createSubscriberDto.skills) },
      });
    } else {
      subscriber.skills = [];
    }

    const saved = await this.subscriberRepository.save(subscriber);
    return this.mapToResponseDto(saved);
  }

  async findSelf(email: string): Promise<SubscriberResponseDto | null> {
    const subscriber = await this.subscriberRepository.findOne({
      where: { email },
      relations: ['skills'],
    });

    return subscriber ? this.mapToResponseDto(subscriber) : null;
  }

  async updateSelf(
    email: string,
    updateSubscriberDto: UpdateSubscriberDto,
  ): Promise<SubscriberResponseDto> {
    const subscriber = await this.subscriberRepository.findOne({
      where: { email },
      relations: ['skills'],
    });

    if (!subscriber) {
      throw new NotFoundException('Không tìm thấy đăng ký người dùng này');
    }

    if (updateSubscriberDto.skills?.length) {
      subscriber.skills = await this.skillRepository.find({
        where: { id: In(updateSubscriberDto.skills) },
      });
    } else {
      subscriber.skills = [];
    }

    const saved = await this.subscriberRepository.save(subscriber);
    return this.mapToResponseDto(saved);
  }

  async deleteSelf(email: string): Promise<void> {
    const subscriber = await this.subscriberRepository.findOne({
      where: { email },
    });

    if (!subscriber) {
      throw new NotFoundException('Không tìm thấy đăng ký người dùng này');
    }

    await this.subscriberRepository.remove(subscriber);
  }

  private mapToResponseDto(subscriber: Subscriber): SubscriberResponseDto {
    return {
      id: subscriber.id,
      email: subscriber.email,
      skills:
        subscriber.skills?.map((skill) => ({
          id: skill.id,
          name: skill.name,
        })) ?? [],
    };
  }
}
