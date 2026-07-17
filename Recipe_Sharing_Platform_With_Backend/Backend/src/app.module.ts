/**
 * ─────────────────────────────────────────────────────────────────────────────
 * APP MODULE — app.module.ts
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Module racine de l'application CookShare.
 * C'est le point d'entrée du graphe de dépendances NestJS.
 *
 * Ordre d'import recommandé :
 * 1. Modules d'infrastructure (Config, TypeORM)
 * 2. Modules fonctionnels (Auth, Users, Recipes...)
 *
 * Structure finale :
 * AppModule
 * ├── ConfigModule (variables d'env)
 * ├── TypeOrmModule (connexion PostgreSQL)
 * ├── AuthModule   (register, login, refresh)
 * ├── UsersModule  (profil, favoris)
 * ├── RecipesModule (CRUD recettes, toggle favori)
 * ├── CommentsModule (commentaires)
 * ├── RatingsModule  (notes)
 * └── UploadModule   (Cloudinary)
 */

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Modules métier
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RecipesModule } from './recipes/recipes.module';
import { CommentsModule } from './comments/comments.module';
import { RatingsModule } from './ratings/ratings.module';
import { UploadModule } from './upload/upload.module';

// Entités TypeORM (pour autoLoadEntities ou vérification)
import { User } from './users/user.entity';
import { Recipe } from './recipes/recipe.entity';
import { Comment } from './comments/comment.entity';
import { Rating } from './ratings/rating.entity';
import { Favorite } from './favorites/favorite.entity';

@Module({
  imports: [
    /**
     * ConfigModule.forRoot({ isGlobal: true })
     * Charge le fichier .env et rend ConfigService disponible partout.
     * isGlobal: true évite de l'importer dans chaque module.
     */
    ConfigModule.forRoot({ isGlobal: true }),

    /**
     * TypeOrmModule.forRootAsync
     * Connexion PostgreSQL configurée via les variables d'environnement.
     * forRootAsync attend que ConfigModule soit prêt (chargement async du .env).
     */
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProd = config.get('NODE_ENV') === 'production';

        if (isProd) {
          /**
           * PRODUCTION : utilisation d'une URL de connexion complète.
           * Nécessaire pour Supabase, Railway, Neon...
           * ssl.rejectUnauthorized: false est requis pour ces services.
           */
          return {
            type: 'postgres',
            url: config.get('DB_URL'),
            /**
             * autoLoadEntities: true → TypeORM détecte automatiquement
             * les entités enregistrées via forFeature() dans les modules.
             * Plus besoin de les lister manuellement ici.
             */
            autoLoadEntities: true,
            synchronize: true,  // En prod réelle, utiliser des migrations
            dropSchema: false,
            ssl: true,
            extra: { ssl: { rejectUnauthorized: false } },
          };
        }

        /**
         * DÉVELOPPEMENT : connexion avec paramètres individuels.
         * synchronize: true → TypeORM crée/modifie automatiquement les tables.
         * dropSchema: false → conserve les données entre les redémarrages.
         *
         * ATTENTION : mettre dropSchema: true efface toute la base à chaque restart !
         * Utile seulement pour repartir de zéro pendant le dev.
         */
        return {
          type: 'postgres',
          host: config.get('DB_HOST', 'localhost'),
          port: Number(config.get('DB_PORT', '5432')),
          username: config.get('DB_USER', 'postgres'),
          password: String(config.get('DB_PASSWORD', '')),
          database: config.get('DB_NAME', 'cookshare'),
          autoLoadEntities: true,
          synchronize: true,
          dropSchema: false,
          /**
           * logging: true → affiche toutes les requêtes SQL dans la console.
           * Très utile en développement pour déboguer les performances et
           * comprendre les requêtes générées par TypeORM.
           * Désactiver en production !
           */
          logging: ['error'],
        };
      },
    }),

    // Modules fonctionnels (l'ordre n'a pas d'importance pour NestJS)
    AuthModule,
    UsersModule,
    RecipesModule,
    CommentsModule,
    RatingsModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
