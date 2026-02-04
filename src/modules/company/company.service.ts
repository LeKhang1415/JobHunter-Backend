import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from './entities/company.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { CompanyLogo } from './entities/company-logo.entity';
import { UploadService } from '../upload/upload.service';
import { CompanyResponseDto } from './dtos/company-response.dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CreateCompanyDto } from './dtos/create-company.dto';
import { UsersService } from '../users/users.service';
import { UpdateCompanyDto } from './dtos/update-company.dto';
import { PaginationProvider } from 'src/common/pagination/providers/pagination.provider';
import { PaginationQueryDto } from 'src/common/pagination/dtos/pagination-query.dto';
import { Paginated } from 'src/common/pagination/interfaces/paginated.interface';
import { RecruiterRequestDto } from './dtos/recruiter-request.dto';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,

    @InjectRepository(CompanyLogo)
    private readonly companyLogoRepository: Repository<CompanyLogo>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,

    private readonly uploadService: UploadService,

    private readonly paginationProvider: PaginationProvider,
  ) {}

  async createCompany(
    createCompanyDto: CreateCompanyDto,
    logoFile: Express.Multer.File,
    isRecruiter: boolean,
    user: JwtPayload,
  ): Promise<CompanyResponseDto> {
    const company = this.companyRepository.create({
      name: createCompanyDto.name,
      description: createCompanyDto.description,
      address: createCompanyDto.address,
    });

    const savedCompany = await this.companyRepository.save(company);

    if (isRecruiter) {
      const existsUser = await this.usersService.findByEmail(user.email);

      if (!existsUser) throw new NotFoundException('Không tìm thấy người dùng');

      if (existsUser.company)
        throw new ConflictException('Người dùng đã có công ty');

      existsUser.company = savedCompany;
      await this.userRepository.save(existsUser);

      savedCompany.owner = existsUser;
    }

    if (logoFile) {
      const uploadResult = await this.uploadService.uploadImage(
        logoFile,
        'company-logos',
      );

      const logo = this.companyLogoRepository.create({
        logoUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        company: savedCompany,
      });

      savedCompany.companyLogo = await this.companyLogoRepository.save(logo);

      await this.companyRepository.save(savedCompany);
    }

    return this.mapToResponseDto(savedCompany);
  }

  async updateCompany(
    updateCompanyDto: UpdateCompanyDto,
    id: string,
    logoFile: Express.Multer.File,
    isRecruiter: boolean,
    user: JwtPayload,
  ): Promise<CompanyResponseDto> {
    let company: Company;

    if (isRecruiter) {
      const existsUser = await this.userRepository.findOne({
        where: { email: user.email },
        relations: ['company', 'company.companyLogo'],
      });

      if (!existsUser) throw new NotFoundException('Không tìm thấy người dùng');

      if (!existsUser.company)
        throw new NotFoundException('Không tìm thấy công ty người dùng');

      company = existsUser.company;
    } else {
      company = await this.findById(id);
    }

    if (updateCompanyDto.name !== undefined)
      company.name = updateCompanyDto.name;
    if (updateCompanyDto.description !== undefined)
      company.description = updateCompanyDto.description;
    if (updateCompanyDto.address !== undefined)
      company.address = updateCompanyDto.address;

    if (logoFile) {
      const uploadResult = await this.uploadService.uploadImage(
        logoFile,
        'company-logos',
      );

      if (company.companyLogo?.publicId) {
        await this.uploadService.deleteByPublicId(company.companyLogo.publicId);
      }

      if (!company.companyLogo) {
        company.companyLogo = this.companyLogoRepository.create({
          company,
        });
      }

      company.companyLogo.logoUrl = uploadResult.secure_url;
      company.companyLogo.publicId = uploadResult.public_id;
    }

    const savedCompany = await this.companyRepository.save(company);

    return this.mapToResponseDto(savedCompany);
  }

  async findAllCompanies(
    pagination: PaginationQueryDto,
  ): Promise<Paginated<CompanyResponseDto>> {
    const paginated = await this.paginationProvider.paginateQuery(
      pagination,
      this.companyRepository,
      {},
      {},
      ['companyLogo', 'owner'],
    );

    return {
      data: paginated.data.map((company) => this.mapToResponseDto(company)),
      meta: paginated.meta,
    };
  }

  async findCompanyById(id: string): Promise<CompanyResponseDto> {
    const company = await this.findById(id);

    return this.mapToResponseDto(company);
  }

  async findSelfCompany(user: JwtPayload): Promise<CompanyResponseDto> {
    const existsUser = await this.usersService.findByEmail(user.email);

    if (!existsUser) throw new NotFoundException('Không tìm thấy người dùng');

    if (existsUser.company == null)
      throw new NotFoundException('Không tìm thấy công ty người dùng');

    return this.mapToResponseDto(existsUser.company);
  }

  async addMemberToCompany(
    recruiterRequestDto: RecruiterRequestDto,
    user: JwtPayload,
  ): Promise<void> {
    const currentUser = await this.userRepository.findOne({
      where: { email: user.email },
      relations: ['company'],
    });

    if (!currentUser) throw new NotFoundException('Không tìm thấy người dùng');

    if (!currentUser.company)
      throw new NotFoundException('Người dùng không có công ty');

    const recruiter = await this.userRepository.findOne({
      where: { email: recruiterRequestDto.email },
      relations: ['company'],
    });

    if (!recruiter)
      throw new NotFoundException('Không tìm thấy người dùng cần thêm');

    if (recruiter.company)
      throw new ConflictException('Người dùng cần thêm đã có công ty');

    recruiter.company = currentUser.company;
    await this.userRepository.save(recruiter);
  }
  async findById(id: string): Promise<Company> {
    const company = await this.companyRepository.findOne({
      where: { id },
      relations: ['companyLogo', 'owner'],
    });

    if (!company) {
      throw new NotFoundException('Không tìm thấy công ty');
    }

    return company;
  }

  async removeMemberFromCompany(
    recruiterRequestDto: RecruiterRequestDto,
    user: JwtPayload,
  ): Promise<void> {
    const currentUser = await this.userRepository.findOne({
      where: { email: user.email },
      relations: ['company', 'company.owner'],
    });

    if (!currentUser) throw new NotFoundException('Không tìm thấy người dùng');

    if (!currentUser.company)
      throw new NotFoundException('Người dùng không có công ty');

    if (currentUser.company.owner?.id !== currentUser.id)
      throw new ConflictException('Không có quyền truy cập');

    const recruiter = await this.userRepository.findOne({
      where: { email: recruiterRequestDto.email },
      relations: ['company'],
    });

    if (!recruiter)
      throw new NotFoundException('Không tìm thấy người dùng cần loại bỏ');

    if (!recruiter.company)
      throw new NotFoundException('Người dùng cần loại bỏ không có công ty');

    if (recruiter.company.id !== currentUser.company.id)
      throw new ConflictException('Người dùng này thuộc công ty khác');

    recruiter.company = null;
    await this.userRepository.save(recruiter);
  }

  private mapToResponseDto(company: Company): CompanyResponseDto {
    return {
      id: company.id,
      name: company.name,
      description: company.description,
      address: company.address,

      logoUrl: company.companyLogo ? company.companyLogo.logoUrl : null,

      owner: company.owner
        ? {
            id: company.owner.id,
            email: company.owner.email,
          }
        : null,
    };
  }
}
