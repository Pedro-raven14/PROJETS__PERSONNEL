import { Test, TestingModule } from '@nestjs/testing';
import { SoumissionController } from './soumission.controller';

describe('SoumissionController', () => {
  let controller: SoumissionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SoumissionController],
    }).compile();

    controller = module.get<SoumissionController>(SoumissionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
