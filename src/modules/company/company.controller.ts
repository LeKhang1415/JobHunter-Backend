import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CurrentUser } from 'src/common/decorators/user-infor.decorator';
import { UpdateCompanyDto } from './dtos/update-company.dto';
import { CreateCompanyDto } from './dtos/create-company.dto';
import { RoleEnum } from 'src/common/enums/role.enum';
import { PaginationQueryDto } from 'src/common/pagination/dtos/pagination-query.dto';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  @UseInterceptors(FileInterceptor('logo'))
  createCompany(
    @Body() createCompanyDto: CreateCompanyDto,
    @UploadedFile() logoFile: Express.Multer.File,
    @CurrentUser() user: JwtPayload,
  ) {
    const isRecruiter = user.role === RoleEnum.RECRUITER;

    return this.companyService.createCompany(
      createCompanyDto,
      logoFile,
      isRecruiter,
      user,
    );
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('logo'))
  updateCompany(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @UploadedFile() logoFile: Express.Multer.File,
    @CurrentUser() user: JwtPayload,
  ) {
    const isRecruiter = user.role === RoleEnum.RECRUITER;

    return this.companyService.updateCompany(
      updateCompanyDto,
      id,
      logoFile,
      isRecruiter,
      user,
    );
  }

  @Get()
  findAllCompanies(@Query() pagination: PaginationQueryDto) {
    return this.companyService.findAllCompanies(pagination);
  }

  @Get(':id')
  findCompanyById(@Param('id') id: string) {
    return this.companyService.findCompanyById(id);
  }

  @Get('me/company')
  findSelfCompany(@CurrentUser() user: JwtPayload) {
    return this.companyService.findSelfCompany(user);
  }
}
