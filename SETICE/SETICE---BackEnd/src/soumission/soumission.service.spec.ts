import { Test, TestingModule } from '@nestjs/testing';
import { SoumissionService } from './soumission.service';

describe('SoumissionService', () => {
  let service: SoumissionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SoumissionService],
    }).compile();

    service = module.get<SoumissionService>(SoumissionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
