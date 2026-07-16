import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const BUCKET = 'contrats';

@Injectable()
export class SupabaseStorageService {
  private readonly client: SupabaseClient;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;

    if (!url || !key) {
      throw new InternalServerErrorException(
        'SUPABASE_URL et SUPABASE_SERVICE_KEY doivent etre definis dans .env',
      );
    }

    this.client = createClient(url, key);
  }

  /**
   * Upload un Buffer PDF vers Supabase Storage
   * @param buffer  Contenu du PDF
   * @param fileName  Nom du fichier dans le bucket (ex: contrat_12_1234567890.pdf)
   * @returns URL publique du fichier
   */
  async uploadPdf(buffer: Buffer, fileName: string): Promise<string> {
    const { error } = await this.client.storage
      .from(BUCKET)
      .upload(fileName, buffer, {
        contentType: 'application/pdf',
        upsert: true, // écrase si le fichier existe déjà (cas re-génération)
      });

    if (error) {
      throw new InternalServerErrorException(
        `Erreur upload Supabase Storage : ${error.message}`,
      );
    }

    // Construire l'URL publique
    const { data } = this.client.storage.from(BUCKET).getPublicUrl(fileName);
    return data.publicUrl;
  }

  /**
   * Supprimer un fichier du bucket (optionnel — pour nettoyage)
   */
  async deletePdf(fileName: string): Promise<void> {
    await this.client.storage.from(BUCKET).remove([fileName]);
  }
}
