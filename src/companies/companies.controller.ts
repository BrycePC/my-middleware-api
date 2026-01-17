import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompanyDto } from './dto/company.dto';

@Controller('v1/companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get(':id')
  getCompany(@Param('id', ParseIntPipe) id: number): Promise<CompanyDto> {
    // The following block is added here only to support integration test cases.
    if (id < 0 && process.env.NODE_ENV === 'test') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return JSON.parse(`{ "id": "TEST INVALID FORMAT" }`);
    }

    return this.companiesService.getCompany(id);
  }
}
