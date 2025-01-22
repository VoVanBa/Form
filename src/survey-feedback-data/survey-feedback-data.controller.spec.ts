import { Test, TestingModule } from '@nestjs/testing';
import { SurveyFeedbackDataController } from './survey-feedback-data.controller';

describe('SurveyFeedbackDataController', () => {
  let controller: SurveyFeedbackDataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SurveyFeedbackDataController],
    }).compile();

    controller = module.get<SurveyFeedbackDataController>(SurveyFeedbackDataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
