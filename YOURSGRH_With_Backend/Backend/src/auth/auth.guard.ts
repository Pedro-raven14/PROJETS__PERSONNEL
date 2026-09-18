import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Token manquant');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      // Le payload est accessible via req.employee dans les controllers
      (request as any)['employee'] = payload;
    } catch {
      throw new UnauthorizedException('Token invalide ou expiré');
    }

    return true;
  }

  private extractToken(request: Request): string | undefined {
    // Priorité 1 : header Authorization Bearer
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (type === 'Bearer' && token) return token;

    // Priorité 2 : query param ?token= (pour les iframes et téléchargements directs)
    const queryToken = (request as any).query?.token;
    if (queryToken && typeof queryToken === 'string') return queryToken;

    return undefined;
  }
}
