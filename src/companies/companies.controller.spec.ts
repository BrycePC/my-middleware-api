import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from '../companies.service';
import { CompanyDto } from './dto/company.dto';
import * as path from 'path';
import jestOpenAPI from 'jest-openapi';

jestOpenAPI(path.join(__dirname, '../../openapi-companies.yaml'));

describe('CompaniesController', () => {
  let companiesController: CompaniesController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CompaniesController],
      providers: [CompaniesService],
    }).compile();

    companiesController = app.get<CompaniesController>(CompaniesController);

    jest.spyOn(global, 'fetch').mockImplementation((url: string) => {
      if (url.includes('/1.xml')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          text: () =>
            Promise.resolve(
              '<Data><id>1</id><name>MWNZ</name><description>..is awesome</description></Data>',
            ),
        } as Response);
      }
      if (url.includes('/2.xml')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          text: () =>
            Promise.resolve(
              '<Data><id>2</id><name>Other</name><description>....is not</description></Data>',
            ),
        } as Response);
      }
      if (url.includes('/3.xml')) {
        return Promise.resolve({
          ok: false,
          status: 404,
          text: () => Promise.resolve('404: Not Found'),
        } as Response);
      }
      if (url.includes('/4.xml')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          text: () =>
            Promise.resolve(
              '<Data><id>A</id><name>Other</name><description>....is not</description></Data>',
            ),
        } as Response);
      }
      return Promise.reject(new Error('Not found'));
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('root', () => {
    it('should return JSON response for company 1', async () => {
      const expectedResult = JSON.parse(
        `{"id":1,"name":"MWNZ","description":"..is awesome"}`,
      ) as CompanyDto;
      const result = await companiesController.getCompany(1);
      expect(result).toStrictEqual(expectedResult);
      expect({
        status: 200,
        req: { method: 'GET', path: '/v1/companies/1' },
        body: result,
      }).toSatisfyApiSpec();
    });
  });

  describe('root', () => {
    it('should return JSON response for company 2', async () => {
      const expectedResult = JSON.parse(
        `{"id":2,"name":"Other","description":"....is not"}`,
      ) as CompanyDto;
      const result = await companiesController.getCompany(2);
      expect(result).toStrictEqual(expectedResult);
      expect({
        status: 200,
        req: { method: 'GET', path: '/v1/companies/2' },
        body: result,
      }).toSatisfyApiSpec();
    });
  });

  describe('root', () => {
    it('should return Not Found error for invalid company id=3', async () => {
      await expect(companiesController.getCompany(3)).rejects.toMatchObject({
        response: {
          error: 'Not Found',
        },
      });
    });
  });

  describe('root', () => {
    it('should fail with an api spec validation error due to incorrect value for id in response', async () => {
      const result = await companiesController.getCompany(4);
      console.log(result);
      expect({
        status: 200,
        req: { method: 'GET', path: '/v1/companies/4' },
        body: result,
      }).not.toSatisfyApiSpec();
    });
  });
});
