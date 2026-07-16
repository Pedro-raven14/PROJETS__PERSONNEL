import { Test, TestingModule } from '@nestjs/testing';
import { CongesController } from './conges.controller';

describe('CongesController', () => {
  let controller: CongesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CongesController],
    }).compile();

    controller = module.get<CongesController>(CongesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
