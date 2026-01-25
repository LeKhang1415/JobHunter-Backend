export class CompanyInformationDto {
  id: string;
  name: string;
  address: string;
  logoUrl: string;
}

export class RoleInformationDto {
  id: string;
  name: string;
  description: string;
}

export class UserResponseDto {
  id: string;
  name: string;
  email: string;
  address: string;
  gender: string;
  userImgUrl: string;
  company?: CompanyInformationDto | null;
  role?: RoleInformationDto | null;
  createdAt: Date;
  updatedAt: Date;
}
