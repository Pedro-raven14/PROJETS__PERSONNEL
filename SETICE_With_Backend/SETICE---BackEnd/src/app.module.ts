import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UtilisateurModule } from './utilisateur/utilisateur.module';
import { DirecteurModule } from './directeur/directeur.module';
import { FormateurModule } from './formateur/formateur.module';
import { EtudiantModule } from './etudiant/etudiant.module';
import { TechnicienModule } from './technicien/technicien.module';
import { EspacePedagogiqueModule } from './espace_pedagogique/espace_pedagogique.module';
import { PromotionModule } from './promotion/promotion.module';
import { AuthModule } from './auth/auth.module';
import { MatiereModule } from './matiere/matiere.module';
import { SoumissionModule } from './soumission/soumission.module';
import { TravailModule } from './travail/travail.module';
import { EquipeModule } from './equipe/equipe.module';
import { RankingModule } from './ranking/ranking.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // TypeOrmModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: (configService: ConfigService) => ({
    //     type: 'postgres',
    //     host: configService.get('DB_HOST'),
    //     port: Number(configService.get('DB_PORT')),
    //     username: configService.get('DB_USER'),
    //     password: String(configService.get('DB_PASSWORD')),
    //     database: configService.get('DB_NAME'),
    //     entities: [__dirname + '/**/*.entity{.ts,.js}'],
    //     synchronize: true,
    //     dropSchema: false,
    //   }),
    // }),
    TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    type: 'postgres',
    url:configService.get('DB_URL'),
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    // host: configService.get('DB_HOST'),
    // port: configService.get<number>('DB_PORT'),
    // username: configService.get('DB_USER'),
    // password: configService.get('DB_PASSWORD'),
    // database: configService.get('DB_NAME'),
    autoLoadEntities: true,
    synchronize: true,
    dropSchema: false,
    ssl: true, // Important pour Supabase
    extra: {
      ssl: {
        rejectUnauthorized: false
      }
    }
  }),
}),
    UtilisateurModule,
    DirecteurModule,
    FormateurModule,
    EtudiantModule,
    TechnicienModule,
    EspacePedagogiqueModule,
    PromotionModule,
    AuthModule,
    MatiereModule,
    SoumissionModule,
    TravailModule,
    EquipeModule,
    RankingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
