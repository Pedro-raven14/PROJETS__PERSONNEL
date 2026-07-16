import { Test, TestingModule } from '@nestjs/testing';
import { CycleEvaluationService } from './cycle_evaluation.service';

describe('CycleEvaluationService', () => {
  let service: CycleEvaluationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CycleEvaluationService],
    }).compile();

    service = module.get<CycleEvaluationService>(CycleEvaluationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
