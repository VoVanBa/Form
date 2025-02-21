import { Test, TestingModule } from '@nestjs/testing';
import { QuestionConditionService } from './question-condition.service';

describe('QuestionConditionService', () => {
  let service: QuestionConditionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuestionConditionService],
    }).compile();

    service = module.get<QuestionConditionService>(QuestionConditionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
