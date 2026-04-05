import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { RequirePermissions } from 'src/common/decorators/permission.decorator';
import { CurrentUser } from 'src/common/decorators/user-infor.decorator';

import { JobService } from './job.service';
import { CreateJobDto } from './dtos/create-job.dto';
import { UpdateJobDto } from './dtos/update-job.dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { RoleEnum } from 'src/common/enums/role.enum';

@Controller('job')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @RequirePermissions('POST /jobs')
  @ResponseMessage('Tạo công việc thành công')
  @Post()
  create(@Body() createJobDto: CreateJobDto, @CurrentUser() user: JwtPayload) {
    const isRecruiter = user.role === RoleEnum.RECRUITER;

    return this.jobService.create(createJobDto, isRecruiter, user);
  }

  @RequirePermissions('GET /jobs/:id')
  @ResponseMessage('Lấy thông tin công việc thành công')
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.jobService.findById(id);
  }

  @RequirePermissions('GET /jobs/company/:companyId')
  @ResponseMessage('Lấy danh sách công việc của công ty thành công')
  @Get('company/:companyId')
  findByCompanyId(@Param('companyId') companyId: string) {
    return this.jobService.findByCompanyId(companyId);
  }

  @RequirePermissions('PATCH /jobs/:id')
  @ResponseMessage('Cập nhật công việc thành công')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateJobDto: UpdateJobDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const isRecruiter = user.role === RoleEnum.RECRUITER;
    return this.jobService.update(id, updateJobDto, isRecruiter, user);
  }

  @RequirePermissions('DELETE /jobs/:id')
  @ResponseMessage('Xóa công việc thành công (Admin)')
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.jobService.delete(id);
  }

  @RequirePermissions('DELETE /jobs/recruiter/:id')
  @ResponseMessage('Nhà tuyển dụng xóa công việc thành công')
  @Delete('recruiter/:id')
  deleteForRecruiter(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.jobService.deleteForRecruiter(id, user);
  }
}
