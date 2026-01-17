import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { XMLParser } from 'fast-xml-parser';
import { CompanyDto } from './companies/dto/company.dto';

// import { CompanyDto } from './companies/dto/company.dto';

@Injectable()
export class CompaniesService {
  async getCompany(id: number): Promise<CompanyDto> {
    const url = `https://raw.githubusercontent.com/MiddlewareNewZealand/evaluation-instructions/main/xml-api/${id}.xml`;

    try {
      const response = await fetch(url);

      if (response.status === 404) {
        throw new NotFoundException({
          error: 'Not Found',
        });
      }

      if (!response.ok) {
        throw new InternalServerErrorException({
          error: 'Internal Server Error',
        });
      }

      const xml: any = await response.text();
      console.debug(xml);

      const parser = new XMLParser();
      const parsed = parser.parse(xml as string) as { Data: CompanyDto };
      const json = parsed.Data;
      console.log(json);

      return json;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      console.error('Unknown error', error);
      throw new InternalServerErrorException({
        error: 'Internal Server Error',
        error_description: 'An unexpected error occurred',
      });
    }
  }
}
