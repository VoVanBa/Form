import { Test, TestingModule } from '@nestjs/testing';
import { ResponseSurveyController } from './response-survey.controller';

describe('ResponseSurveyController', () => {
  let controller: ResponseSurveyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResponseSurveyController],
    }).compile();

    controller = module.get<ResponseSurveyController>(ResponseSurveyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
