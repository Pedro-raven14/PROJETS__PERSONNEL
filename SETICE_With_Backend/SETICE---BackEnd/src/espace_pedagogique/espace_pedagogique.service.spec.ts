import { Test, TestingModule } from '@nestjs/testing';
import { EspacePedagogiqueService } from './espace_pedagogique.service';

describe('EspacePedagogiqueService', () => {
  let service: EspacePedagogiqueService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EspacePedagogiqueService],
    }).compile();

    service = module.get<EspacePedagogiqueService>(EspacePedagogiqueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
