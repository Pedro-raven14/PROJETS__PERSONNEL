import { Test, TestingModule } from '@nestjs/testing';
import { FormateurController } from './formateur.controller';

describe('FormateurController', () => {
  let controller: FormateurController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FormateurController],
    }).compile();

    controller = module.get<FormateurController>(FormateurController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
