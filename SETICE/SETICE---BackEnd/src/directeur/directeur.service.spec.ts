import { Test, TestingModule } from '@nestjs/testing';
import { DirecteurService } from './directeur.service';

describe('DirecteurService', () => {
  let service: DirecteurService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DirecteurService],
    }).compile();

    service = module.get<DirecteurService>(DirecteurService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
