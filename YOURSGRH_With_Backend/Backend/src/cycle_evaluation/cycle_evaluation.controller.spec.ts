import { Test, TestingModule } from '@nestjs/testing';
import { CycleEvaluationController } from './cycle_evaluation.controller';

describe('CycleEvaluationController', () => {
  let controller: CycleEvaluationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CycleEvaluationController],
    }).compile();

    controller = module.get<CycleEvaluationController>(CycleEvaluationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
