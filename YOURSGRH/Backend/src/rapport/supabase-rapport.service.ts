import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const BUCKET = 'rapports';

@Injectable()
export class SupabaseRapportService {
  private readonly client: SupabaseClient;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;

    if (!url || !key) {
      throw new InternalServerErrorException(
        'SUPABASE_URL et SUPABASE_SERVICE_KEY doivent être définis dans .env',
      );
    }

    this.client = createClient(url, key);
  }

  async uploadPdf(buffer: Buffer, fileName: string): Promise<string> {
    const { error } = await this.client.storage
      .from(BUCKET)
      .upload(fileName, buffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (error) {
      throw new InternalServerErrorException(
        `Erreur upload Supabase Storage (rapports) : ${error.message}`,
      );
    }

    const { data } = this.client.storage.from(BUCKET).getPublicUrl(fileName);
    return data.publicUrl;
  }

  async deletePdf(fileName: string): Promise<void> {
    await this.client.storage.from(BUCKET).remove([fileName]);
  }
}
