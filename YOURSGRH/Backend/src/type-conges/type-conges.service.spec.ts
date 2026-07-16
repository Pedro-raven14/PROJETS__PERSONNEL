import { Test, TestingModule } from '@nestjs/testing';
import { TypeCongesService } from './type-conges.service';

describe('TypeCongesService', () => {
  let service: TypeCongesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TypeCongesService],
    }).compile();

    service = module.get<TypeCongesService>(TypeCongesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
