import { Test, TestingModule } from '@nestjs/testing';
import { AnswerOptionController } from './answer-option.controller';

describe('AnswerOptionController', () => {
  let controller: AnswerOptionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnswerOptionController],
    }).compile();

    controller = module.get<AnswerOptionController>(AnswerOptionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
