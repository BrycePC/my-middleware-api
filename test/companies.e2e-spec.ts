import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { CompaniesService } from '../src/companies/companies.service';
import { ValidationExceptionFilter } from '../src/common/filters/validation-exception.filter';
import * as OpenApiValidator from 'express-openapi-validator';

describe('CompaniesController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.use(
      OpenApiValidator.middleware({
        apiSpec: './openapi-companies.yaml',
        validateRequests: true,
        validateResponses: true,
      }),
    );

    await app.init();
  });

  it('/companies/1 (GET)', () => {
    return request(app.getHttpServer())
      .get('/v1/companies/1')
      .expect(200)
      .expect('{"id":1,"name":"MWNZ","description":"..is awesome"}');
  });

  it('/companies/2 (GET)', () => {
    return request(app.getHttpServer())
      .get('/v1/companies/2')
      .expect(200)
      .expect('{"id":2,"name":"Other","description":"....is not"}');
  });

  it('/companies/3 (GET)', () => {
    return request(app.getHttpServer())
      .get('/v1/companies/3')
      .expect(404)
      .expect('{"error":"Not Found"}');
  });

  it('should reject invalid response format', async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(CompaniesService)
      .useValue({
        getCompany: () => Promise.resolve(JSON.parse(`{ "id": "TEST INVALID FORMAT" }`)),
      })
      .compile();

    const testApp = moduleFixture.createNestApplication();

    testApp.use(
      OpenApiValidator.middleware({
        apiSpec: './openapi-companies.yaml',
        validateRequests: true,
        validateResponses: true,
      }),
    );

    testApp.useGlobalFilters(new ValidationExceptionFilter());

    await testApp.init();

    await request(testApp.getHttpServer()).get('/v1/companies/1')
      .expect(500)
      .expect((res) => {
        console.log('Response body:', JSON.stringify(res.body));
        expect(res.body).toHaveProperty('error');
        expect(res.body).toHaveProperty('error_description');
      });

    await testApp.close();
  });
});
