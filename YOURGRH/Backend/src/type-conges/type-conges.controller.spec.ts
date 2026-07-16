import { Test, TestingModule } from '@nestjs/testing';
import { TypeCongesController } from './type-conges.controller';

describe('TypeCongesController', () => {
  let controller: TypeCongesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TypeCongesController],
    }).compile();

    controller = module.get<TypeCongesController>(TypeCongesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
