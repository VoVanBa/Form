import { Test, TestingModule } from '@nestjs/testing';
import { ResponseSurveyService } from './response-survey.service';

describe('ResponseSurveyService', () => {
  let service: ResponseSurveyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResponseSurveyService],
    }).compile();

    service = module.get<ResponseSurveyService>(ResponseSurveyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
