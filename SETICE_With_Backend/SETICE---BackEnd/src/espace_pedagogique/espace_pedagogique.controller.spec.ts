import { Test, TestingModule } from '@nestjs/testing';
import { EspacePedagogiqueController } from './espace_pedagogique.controller';

describe('EspacePedagogiqueController', () => {
  let controller: EspacePedagogiqueController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EspacePedagogiqueController],
    }).compile();

    controller = module.get<EspacePedagogiqueController>(EspacePedagogiqueController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
