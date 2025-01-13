import { Test, TestingModule } from '@nestjs/testing';
import { ResponseFeedbackService } from './response-feedback.service';

describe('ResponseFeedbackService', () => {
  let service: ResponseFeedbackService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResponseFeedbackService],
    }).compile();

    service = module.get<ResponseFeedbackService>(ResponseFeedbackService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
