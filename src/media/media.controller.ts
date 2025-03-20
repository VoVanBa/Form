import { MediaService } from 'src/media/services/media.service';
import {
  BadRequestException,
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  HttpException,
  HttpStatus,
  Query,
  Delete,
  Param,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/common/decorater/role.customize';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/role-auth.guard';
import { AnswerOptionMediaService } from './services/answer-option-media.service';
import { QuestionMediaService } from './services/question-media.service';
@Controller('media')
export class MediaController {
  constructor(
    private mediaService: MediaService,
    private answerOptionMediaService: AnswerOptionMediaService,
    private questionMediaService: QuestionMediaService,
  ) {}

  @Post('upload')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      limits: { fileSize: 1 * 1024 * 1024 },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return callback(
            new BadRequestException('Only image files are allowed!'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async uploadImages(
    @Query('type') type: 'question' | 'answerOption',
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (type === 'question' && files.length > 1) {
      throw new BadRequestException('A question can only have one image.');
    }
    return this.mediaService.uploadImages(files);
  }

  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('upload-images/answer-option')
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return callback(
            new BadRequestException('Only image files are allowed!'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async uploadAnswerOptionImages(
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    try {
      if (!files || files.length === 0) {
        throw new HttpException('No files provided', HttpStatus.BAD_REQUEST);
      }

      const mediaIds =
        await this.answerOptionMediaService.createAnwerOptionMedia(files);
      return {
        message: 'Images uploaded successfully',
        mediaIds,
      };
    } catch (error) {
      throw new HttpException(
        `Error uploading images: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('upload-image/question')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 1 * 1024 * 1024 },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return callback(
            new BadRequestException('Only image files are allowed!'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async uploadQuestionImage(@UploadedFile() file: Express.Multer.File) {
    try {
      if (!file) {
        throw new HttpException('No file provided', HttpStatus.BAD_REQUEST);
      }

      const mediaId = await this.questionMediaService.createQuestionMedia(file);

      return {
        message: 'Image uploaded successfully',
        mediaId,
      };
    } catch (error) {
      throw new HttpException(
        `Error uploading image: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('/:mediaId')
  async deleteMediaById(@Param('mediaId') mediaId: number) {
    return await this.mediaService.deleteMediaById(mediaId);
  }
}
