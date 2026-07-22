import { IsUrl, IsOptional, IsInt, Min, Max } from 'class-validator';

export class CreateUrlDto {
  @IsUrl({}, { message: "L'URL fournie est invalide." })
  originalUrl: string;

  /**
   * Durée de vie optionnelle en jours (1-365).
   * Si non fourni, le lien n'expire jamais.
   */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  expiresInDays?: number;
}
