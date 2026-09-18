import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class PasswordChangeGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = req.user;

    if (user.mustChangePassword) {
      throw new ForbiddenException(
        'Vous devez changer votre mot de passe avant de continuer',
      );
    }

    return true;
  }
}
