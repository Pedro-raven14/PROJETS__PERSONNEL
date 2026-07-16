import { Test, TestingModule } from '@nestjs/testing';
import { TravailService } from './travail.service';

describe('TravailService', () => {
  let service: TravailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TravailService],
    }).compile();

    service = module.get<TravailService>(TravailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
