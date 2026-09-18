import { Test, TestingModule } from '@nestjs/testing';
import { TechnicienController } from './technicien.controller';

describe('TechnicienController', () => {
  let controller: TechnicienController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TechnicienController],
    }).compile();

    controller = module.get<TechnicienController>(TechnicienController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
