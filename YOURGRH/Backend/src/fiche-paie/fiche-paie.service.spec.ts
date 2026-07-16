import { Test, TestingModule } from '@nestjs/testing';
import { FichePaieService } from './fiche-paie.service';

describe('FichePaieService', () => {
  let service: FichePaieService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FichePaieService],
    }).compile();

    service = module.get<FichePaieService>(FichePaieService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
