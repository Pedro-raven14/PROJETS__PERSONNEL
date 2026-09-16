import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

/*
  Le Controller définit les routes HTTP.
  @Post('register') => POST /auth/register
  @Post('login')    => POST /auth/login

  Le @Body() extrait le JSON du corps de la requête et le passe au DTO
  qui le valide automatiquement grâce au ValidationPipe global.
*/
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /*
    HttpCode(200) : par défaut NestJS retourne 201 pour les POST,
    mais pour le login on retourne 200 car on ne crée rien.
  */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
