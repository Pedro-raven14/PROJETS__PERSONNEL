import { Test, TestingModule } from '@nestjs/testing';
import { MatiereController } from './matiere.controller';

describe('MatiereController', () => {
  let controller: MatiereController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatiereController],
    }).compile();

    controller = module.get<MatiereController>(MatiereController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
