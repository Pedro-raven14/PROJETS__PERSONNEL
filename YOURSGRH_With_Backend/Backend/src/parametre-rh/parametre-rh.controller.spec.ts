import { Test, TestingModule } from '@nestjs/testing';
import { ParametreRhController } from './parametre-rh.controller';

describe('ParametreRhController', () => {
  let controller: ParametreRhController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParametreRhController],
    }).compile();

    controller = module.get<ParametreRhController>(ParametreRhController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
