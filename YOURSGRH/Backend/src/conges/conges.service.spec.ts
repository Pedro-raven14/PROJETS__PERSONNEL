import { Test, TestingModule } from '@nestjs/testing';
import { CongesService } from './conges.service';

describe('CongesService', () => {
  let service: CongesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CongesService],
    }).compile();

    service = module.get<CongesService>(CongesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
