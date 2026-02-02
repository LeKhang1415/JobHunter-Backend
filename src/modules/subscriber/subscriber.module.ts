import { Module } from '@nestjs/common';
import { SubscriberService } from './subscriber.service';
import { SubscriberController } from './subscriber.controller';

@Module({
  controllers: [SubscriberService],
  providers: [SubscriberService],
})
export class SubscribersModule {}
