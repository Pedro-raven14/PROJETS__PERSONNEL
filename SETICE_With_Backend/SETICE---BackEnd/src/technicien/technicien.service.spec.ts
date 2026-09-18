import { Test, TestingModule } from '@nestjs/testing';
import { TechnicienService } from './technicien.service';

describe('TechnicienService', () => {
  let service: TechnicienService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TechnicienService],
    }).compile();

    service = module.get<TechnicienService>(TechnicienService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
