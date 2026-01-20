export class CompanyResponseDto {
  id: string;
  name: string;
  description?: string;
  address?: string;

  logoUrl: string | null;

  owner: {
    id: string;
    email: string;
  } | null;
}
