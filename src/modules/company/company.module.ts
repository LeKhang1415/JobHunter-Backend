import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './entities/company.entity';
import { CompanyLogo } from './entities/company-logo.entity';
import { User } from '../users/entities/user.entity';
import { UploadModule } from '../upload/upload.module';
import { UsersModule } from '../users/users.module';
import { PaginationModule } from 'src/common/pagination/pagination.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company, User, CompanyLogo]),
    UploadModule,
    UsersModule,
    PaginationModule,
  ],
  controllers: [CompanyController],
  providers: [CompanyService],
})
export class CompanyModule {}
