import { Test, TestingModule } from '@nestjs/testing';
import { DirecteurController } from './directeur.controller';

describe('DirecteurController', () => {
  let controller: DirecteurController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DirecteurController],
    }).compile();

    controller = module.get<DirecteurController>(DirecteurController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
