import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { XMLParser } from 'fast-xml-parser';
import { CompanyDto } from './dto/company.dto';

@Injectable()
export class CompaniesService {
  constructor(private configService: ConfigService) {}

  async getCompany(id: number): Promise<CompanyDto> {
    const baseUrl = this.configService.get<string>('XML_API_BASE_URL');
    const url = `${baseUrl}/${id}.xml`;
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
    return parsed.Data;

  }
}
