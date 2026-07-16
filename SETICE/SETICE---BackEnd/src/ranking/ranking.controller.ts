import { Controller, Get, Query } from '@nestjs/common';
import { RankingService } from './ranking.service';


@Controller('ranking')
export class RankingController {
  constructor(private readonly rankingService: RankingService) {}

  @Get('individual')
  getIndividual(@Query('espaceId') espaceId: number) {
    return this.rankingService.getIndividualRanking(+espaceId);
  }

  @Get('team')
  getTeam(@Query('espaceId') espaceId: number) {
    return this.rankingService.getTeamRanking(+espaceId);
  }
}
