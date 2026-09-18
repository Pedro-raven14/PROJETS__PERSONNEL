import { Test, TestingModule } from '@nestjs/testing';
import { FormateurService } from './formateur.service';

describe('FormateurService', () => {
  let service: FormateurService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FormateurService],
    }).compile();

    service = module.get<FormateurService>(FormateurService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
