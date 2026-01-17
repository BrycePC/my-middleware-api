import { IsInt, IsString } from 'class-validator';

export class CompanyDto {
  @IsInt()
  id: number;

  @IsString()
  name: string;

  @IsString()
  description: string;
}
