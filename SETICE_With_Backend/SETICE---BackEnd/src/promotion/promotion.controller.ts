import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { PromotionService } from './promotion.service';
import { Promotion } from './promotion.entity';

@Controller('promotion')
export class PromotionController {
  constructor(private readonly promotionservice: PromotionService) {}

  @Get()
  async getPromo() {
    return await this.promotionservice.getPromo();
  }

  @Post()
  async createPromo(@Body() promotion: Promotion) {
    return await this.promotionservice.createPromo(promotion);
  }
  // Dans PromotionController
  @Put(':id')
  async updatePromo(
    @Param('id') id: number,
    @Body() promotion: Partial<Promotion>,
  ) {
    return await this.promotionservice.updatePromo(id, promotion);
  }

  @Delete(':id')
  async deletePromo(@Param('id') id: number) {
    return await this.promotionservice.deletePromo(id);
  }
}
