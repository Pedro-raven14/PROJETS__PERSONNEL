import { Test, TestingModule } from '@nestjs/testing';
import { FichePaieController } from './fiche-paie.controller';

describe('FichePaieController', () => {
  let controller: FichePaieController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FichePaieController],
    }).compile();

    controller = module.get<FichePaieController>(FichePaieController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
