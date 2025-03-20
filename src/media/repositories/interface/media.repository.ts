import { Media } from 'src/media/entities/Media';

export interface IMediaRepository {
  createMedia(
    url: string,
    fileName: string,
    mimeType: string,
    size: number,
    tx?: any,
  ): Promise<Media>;

  getMediaById(id: number, tx?: any): Promise<Partial<Media> | null>;

  deleteMediaById(id: number, tx?: any): Promise<void>;
}
