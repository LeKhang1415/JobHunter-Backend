export class CompanyResponseDto {
  id: string;
  name: string;
  description?: string;
  address?: string;
  logoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}
