import { Test, TestingModule } from '@nestjs/testing';
import { ResponseFeedbackController } from './response-feedback.controller';

describe('ResponseFeedbackController', () => {
  let controller: ResponseFeedbackController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResponseFeedbackController],
    }).compile();

    controller = module.get<ResponseFeedbackController>(ResponseFeedbackController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
