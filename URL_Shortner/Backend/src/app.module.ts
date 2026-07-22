import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UrlsModule } from './urls/urls.module';
import { Url } from './entities/urls.entity';

@Module({
  imports: [
    // Charger les variables d'environnement depuis .env
    ConfigModule.forRoot({ isGlobal: true }),

    // Connexion TypeORM + PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DB_URL') || undefined,
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USER', 'postgres'),
        password: config.get<string>('DB_PASSWORD', ''),
        database: config.get<string>('DB_NAME', 'url_shortner'),
        entities: [Url],
        synchronize: config.get<string>('NODE_ENV') !== 'production',
        ssl:
          config.get<string>('DB_URL')
            ? { rejectUnauthorized: false }
            : false,
      }),
    }),

    UrlsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
