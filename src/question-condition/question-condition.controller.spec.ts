import { Test, TestingModule } from '@nestjs/testing';
import { QuestionConditionController } from './question-condition.controller';

describe('QuestionConditionController', () => {
  let controller: QuestionConditionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestionConditionController],
    }).compile();

    controller = module.get<QuestionConditionController>(QuestionConditionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
