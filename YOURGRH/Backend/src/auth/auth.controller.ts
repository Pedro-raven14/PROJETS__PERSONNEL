import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { autDTO } from 'src/dto/authDTO';
import { ChangePasswordDto } from 'src/dto/change-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: autDTO) {
    return this.authService.login(dto);
  }

  @UseGuards(AuthGuard)
  @Post('change-password')
  async changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    // req.employee.sub = userId (convention JWT standard)
    return this.authService.changePassword(req.employee.sub, dto.newPassword);
  }
}
