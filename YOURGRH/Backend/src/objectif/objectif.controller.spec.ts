import { Test, TestingModule } from '@nestjs/testing';
import { ObjectifController } from './objectif.controller';

describe('ObjectifController', () => {
  let controller: ObjectifController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ObjectifController],
    }).compile();

    controller = module.get<ObjectifController>(ObjectifController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
