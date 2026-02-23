export class JobResponseDto {
  id: string;
  name: string;
  location: string;
  salary: number;
  quantity: number;
  level: string;
  description: string | null;
  startDate: string;
  endDate: string;
  active: boolean;

  company: {
    id: string;
    name: string;
  } | null;

  skills: {
    id: string;
    name: string;
  }[];
}
