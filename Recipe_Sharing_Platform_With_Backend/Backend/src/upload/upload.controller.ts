/**
 * ─────────────────────────────────────────────────────────────────────────────
 * UPLOAD CONTROLLER — upload.controller.ts
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Gère l'upload d'images vers Cloudinary.
 *
 * Flux d'upload :
 * 1. Client envoie POST /upload/image avec multipart/form-data (champ "file")
 * 2. Multer intercepte et stocke le fichier en mémoire (Buffer)
 * 3. On envoie le buffer à Cloudinary
 * 4. Cloudinary retourne une URL publique
 * 5. On retourne cette URL au frontend
 *
 * POURQUOI Cloudinary ?
 * - CDN mondial → images servies rapidement partout
 * - Transformations à la volée (resize, crop, optimisation)
 * - Gratuit jusqu'à 25 000 requêtes/mois
 * - Alternative : AWS S3 + CloudFront
 */

import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private configService: ConfigService) {
    /**
     * Configurer Cloudinary avec les variables d'environnement.
     * On le fait dans le constructeur car ConfigService est disponible
     * via l'injection de dépendances.
     */
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  /**
   * POST /upload/image
   *
   * @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
   * FileInterceptor('file') → intercepte le champ "file" du multipart/form-data.
   * storage: memoryStorage() → stocke le fichier en mémoire RAM (Buffer)
   * au lieu de l'écrire sur le disque. Pratique pour le transférer directement
   * à Cloudinary sans créer de fichier temporaire.
   *
   * @UploadedFile() file → injecte le fichier uploadé dans le paramètre.
   * Type : Express.Multer.File → contient buffer, originalname, mimetype, size...
   *
   * ParseFilePipe avec validators :
   * - MaxFileSizeValidator : limite la taille (ici 5 Mo = 5 * 1024 * 1024 bytes)
   * - FileTypeValidator : accepte seulement les images (regex sur le mimetype)
   */
  @Post('image')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data') // Swagger sait que c'est un upload de fichier
  @ApiOperation({ summary: 'Upload d\'image vers Cloudinary' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  async uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5 Mo
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|gif|webp)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    /**
     * Vérification manuelle si ParseFilePipe ne catch pas tout
     */
    if (!file) {
      throw new BadRequestException('Aucun fichier reçu');
    }

    /**
     * Upload vers Cloudinary via un stream (pas d'écriture disque).
     *
     * On retourne une Promise car l'upload Cloudinary est asynchrone.
     * cloudinary.uploader.upload_stream() retourne un stream écrivable.
     * On lui envoie le buffer du fichier avec stream.end(file.buffer).
     *
     * Le dossier 'cookshare' organise les images dans Cloudinary.
     */
    const url = await new Promise<string>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'cookshare',
          // Transformer l'image automatiquement : max 800px de large, qualité auto
          transformation: [{ width: 800, crop: 'limit', quality: 'auto' }],
        },
        (error, result) => {
          if (error) return reject(new BadRequestException(error.message));
          if (!result) return reject(new BadRequestException('Upload échoué'));
          resolve(result.secure_url);
        },
      );

      uploadStream.end(file.buffer);
    });

    return { url };
  }
}
