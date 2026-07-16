import { Controller, Get, Param, ParseIntPipe, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('mes-notifications')
  async getMesNotifications(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.notificationService.getMesNotifications(req.employee.sub, Number(page) || 1, Number(limit) || 20);
  }

  @Get('non-lues')
  async getNonLues(@Req() req: any) {
    return this.notificationService.getNonLues(req.employee.sub);
  }

  @Patch(':id/lire')
  async marquerLue(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.notificationService.marquerLue(id, req.employee.sub);
  }

  @Patch('lire-tout')
  async marquerToutesLues(@Req() req: any) {
    return this.notificationService.marquerToutesLues(req.employee.sub);
  }
}
