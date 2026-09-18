import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { authDTO } from './authDTO';
import { ChangePasswordDto } from './change-password.dto';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('Login')
  async login(@Body() authDTO: authDTO) {
    return await this.authService.login(authDTO);
  }

  @UseGuards(AuthGuard)
  @Post('change-password')
  async changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.sub, dto.newPassword);
  }
}
