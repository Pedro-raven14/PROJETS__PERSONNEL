import { Test, TestingModule } from '@nestjs/testing';
import { ParametreRhService } from './parametre-rh.service';

describe('ParametreRhService', () => {
  let service: ParametreRhService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ParametreRhService],
    }).compile();

    service = module.get<ParametreRhService>(ParametreRhService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
