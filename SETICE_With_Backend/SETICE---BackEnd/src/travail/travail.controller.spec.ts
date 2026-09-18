import { Test, TestingModule } from '@nestjs/testing';
import { TravailController } from './travail.controller';

describe('TravailController', () => {
  let controller: TravailController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TravailController],
    }).compile();

    controller = module.get<TravailController>(TravailController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
