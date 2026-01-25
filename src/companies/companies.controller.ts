import { Controller, Get, Param, ParseIntPipe, Header } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompanyDto } from './dto/company.dto';

@Controller('v1/companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get(':id')
  @Header('Cache-Control', 'public, max-age=300')
  getCompany(@Param('id', ParseIntPipe) id: number): Promise<CompanyDto> {
    return this.companiesService.getCompany(id);
  }
}
