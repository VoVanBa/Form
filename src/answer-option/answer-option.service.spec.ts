import { Test, TestingModule } from '@nestjs/testing';
import { AnswerOptionService } from './answer-option.service';

describe('AnswerOptionService', () => {
  let service: AnswerOptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AnswerOptionService],
    }).compile();

    service = module.get<AnswerOptionService>(AnswerOptionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
