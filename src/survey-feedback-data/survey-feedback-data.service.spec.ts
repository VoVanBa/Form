import { Test, TestingModule } from '@nestjs/testing';
import { SurveyFeedbackDataService } from './survey-feedback-data.service';

describe('SurveyFeedbackDataService', () => {
  let service: SurveyFeedbackDataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SurveyFeedbackDataService],
    }).compile();

    service = module.get<SurveyFeedbackDataService>(SurveyFeedbackDataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
