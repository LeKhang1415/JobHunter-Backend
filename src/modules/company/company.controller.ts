import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dtos/create-company.dto';
import { UpdateCompanyDto } from './dtos/update-company.dto';
import { RecruiterRequestDto } from './dtos/recruiter-request.dto';

import { CurrentUser } from 'src/common/decorators/user-infor.decorator';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { RequirePermissions } from 'src/common/decorators/permission.decorator';

import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { RoleEnum } from 'src/common/enums/role.enum';
import { PaginationQueryDto } from 'src/common/pagination/dtos/pagination-query.dto';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @RequirePermissions('POST /company')
  @ResponseMessage('Tạo công ty thành công')
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

  @RequirePermissions('PATCH /company/:id')
  @ResponseMessage('Cập nhật công ty thành công')
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

  @RequirePermissions('GET /company')
  @ResponseMessage('Lấy danh sách công ty thành công')
  @Get()
  findAllCompanies(@Query() pagination: PaginationQueryDto) {
    return this.companyService.findAllCompanies(pagination);
  }

  @RequirePermissions('GET /company/:id')
  @ResponseMessage('Lấy thông tin công ty thành công')
  @Get(':id')
  findCompanyById(@Param('id') id: string) {
    return this.companyService.findCompanyById(id);
  }

  @RequirePermissions('GET /company/me/company')
  @ResponseMessage('Lấy công ty của người dùng thành công')
  @Get('me/company')
  findSelfCompany(@CurrentUser() user: JwtPayload) {
    return this.companyService.findSelfCompany(user);
  }

  @RequirePermissions('POST /company/members')
  @ResponseMessage('Thêm thành viên vào công ty thành công')
  @Post('members')
  addMember(@Body() dto: RecruiterRequestDto, @CurrentUser() user: JwtPayload) {
    return this.companyService.addMemberToCompany(dto, user);
  }

  @RequirePermissions('DELETE /company/members')
  @ResponseMessage('Xóa thành viên khỏi công ty thành công')
  @Delete('members')
  removeMember(
    @Body() dto: RecruiterRequestDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.companyService.removeMemberFromCompany(dto, user);
  }
}
