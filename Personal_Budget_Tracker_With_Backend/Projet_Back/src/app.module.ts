import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// Import des modules métier de l'application
import { TransactionsModule } from './transactions/transactions.module';
import { BudgetsModule } from './budgets/budgets.module';
import { PreferencesModule } from './preferences/preferences.module';
import { StatsModule } from './stats/stats.module';
import { CategoriesModule } from './categories/categories.module';

/**
 * @Module AppModule — Module racine de l'application NestJS
 *
 * C'est le point d'entrée de tout le graphe de dépendances.
 * NestJS démarre ici et résout tous les imports en cascade.
 *
 * Structure :
 * AppModule
 * ├── ConfigModule      (variables d'environnement .env)
 * ├── TypeOrmModule     (connexion PostgreSQL)
 * ├── TransactionsModule
 * ├── BudgetsModule
 * ├── PreferencesModule
 * └── StatsModule
 *       ├── importe TransactionsModule
 *       └── importe BudgetsModule
 */
@Module({
  imports: [
    /**
     * ConfigModule.forRoot({ isGlobal: true })
     *
     * Charge le fichier .env et rend ConfigService accessible partout
     * sans avoir à le ré-importer dans chaque module.
     * isGlobal: true = module singleton partagé dans toute l'app.
     */
    ConfigModule.forRoot({ isGlobal: true }),

    /**
     * TypeOrmModule.forRootAsync
     *
     * POURQUOI forRootAsync et pas forRoot ?
     * forRoot() est synchrone, il n'a pas accès aux variables d'env chargées
     * de manière asynchrone par ConfigModule.
     * forRootAsync() attend que ConfigModule soit prêt avant de s'initialiser.
     *
     * useFactory : fonction qui reçoit ConfigService et retourne la config TypeORM.
     * On adapte la config selon l'environnement (dev vs prod).
     */
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProd = config.get('NODE_ENV') === 'production';

        if (isProd) {
          /**
           * PRODUCTION (ex: Supabase ou Railway)
           * On utilise une URL de connexion complète :
           * postgresql://user:password@host:5432/dbname
           *
           * synchronize: true → TypeORM crée/modifie les tables automatiquement
           * (ok pour un projet perso, désactiver en prod critique)
           * dropSchema: false → NE PAS supprimer les données existantes en prod !
           * ssl: rejectUnauthorized: false → nécessaire pour Supabase/Railway
           */
          return {
            type: 'postgres',
            url: config.get('DB_URL'),
            autoLoadEntities: true, // Charge automatiquement les entités enregistrées via forFeature
            synchronize: true,
            dropSchema: false,
            ssl: true,
            extra: { ssl: { rejectUnauthorized: false } },
          };
        }

        /**
         * DÉVELOPPEMENT (base locale PostgreSQL)
         * dropSchema: true → ATTENTION : recrée la base à chaque redémarrage.
         * C'est pratique en développement (schéma toujours propre)
         * mais détruit toutes les données !
         * Mettre à false si vous voulez garder vos données entre deux redémarrages.
         */
        return {
          type: 'postgres',
          host: config.get('DB_HOST', 'localhost'),
          port: Number(config.get('DB_PORT', '5432')),
          username: config.get('DB_USER', 'postgres'),
          password: String(config.get('DB_PASSWORD', '')),
          database: config.get('DB_NAME', 'budget_tracker'),
          autoLoadEntities: true,
          synchronize: true,
          dropSchema: false, // Mettre true pour repartir de zéro à chaque restart
        };
      },
    }),

    // Modules métier — chaque module encapsule son propre controller + service + entité
    TransactionsModule,
    BudgetsModule,
    PreferencesModule,
    StatsModule,
    CategoriesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
