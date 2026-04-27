import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { RequirePermissions } from 'src/common/decorators/permission.decorator';
import { CurrentUser } from 'src/common/decorators/user-infor.decorator';

import { JobService } from './job.service';
import { CreateJobDto } from './dtos/create-job.dto';
import { UpdateJobDto } from './dtos/update-job.dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { JobPaginationQueryDto } from './dtos/job-pagination-query.dto';

@Controller('jobs')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @RequirePermissions('POST /jobs/recruiter')
  @ResponseMessage('Nhà tuyển dụng tạo công việc thành công')
  @Post('recruiter')
  createForRecruiter(
    @Body() createJobDto: CreateJobDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.jobService.createForRecruiter(createJobDto, user);
  }

  @RequirePermissions('GET /jobs/recruiter')
  @ResponseMessage('Lấy danh sách công việc của công ty thành công')
  @Get('recruiter')
  findAllJobsForRecruiter(
    @Query() query: JobPaginationQueryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.jobService.findAllJobsForRecruiterCompany(query, user);
  }

  @RequirePermissions('PATCH /jobs/recruiter/:id')
  @ResponseMessage('Nhà tuyển dụng cập nhật công việc thành công')
  @Patch('recruiter/:id')
  updateForRecruiter(
    @Param('id') id: string,
    @Body() updateJobDto: UpdateJobDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.jobService.updateForRecruiter(id, updateJobDto, user);
  }

  @RequirePermissions('DELETE /jobs/recruiter/:id')
  @ResponseMessage('Nhà tuyển dụng xóa công việc thành công')
  @Delete('recruiter/:id')
  deleteForRecruiter(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.jobService.deleteForRecruiter(id, user);
  }

  @RequirePermissions('POST /jobs')
  @ResponseMessage('Admin tạo công việc thành công')
  @Post()
  create(@Body() createJobDto: CreateJobDto) {
    return this.jobService.create(createJobDto);
  }

  @RequirePermissions('GET /jobs')
  @ResponseMessage('Lấy danh sách công việc thành công')
  @Get()
  findAll(@Query() query: JobPaginationQueryDto) {
    return this.jobService.findAll(query);
  }

  @RequirePermissions('GET /jobs/company/:companyId')
  @ResponseMessage('Lấy danh sách công việc theo công ty thành công')
  @Get('company/:companyId')
  findByCompanyId(@Param('companyId') companyId: string) {
    return this.jobService.findByCompanyId(companyId);
  }

  @RequirePermissions('GET /jobs/:id')
  @ResponseMessage('Lấy thông tin công việc thành công')
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.jobService.findById(id);
  }

  @RequirePermissions('PATCH /jobs/:id')
  @ResponseMessage('Admin cập nhật công việc thành công')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto) {
    return this.jobService.update(id, updateJobDto);
  }

  @RequirePermissions('DELETE /jobs/:id')
  @ResponseMessage('Admin xóa công việc thành công')
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.jobService.delete(id);
  }
}
