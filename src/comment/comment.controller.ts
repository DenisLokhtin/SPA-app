import {
  Controller,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { SharpPipe } from './pipes/sharp.pipe';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fileStorage from './utils/fileStorage';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post('upload/:id')
  @UseInterceptors(FileInterceptor('file', fileStorage.saveFileToStorage))
  async uploadFile(
    @UploadedFile(SharpPipe) file,
    @Param('id') commentId: number,
  ) {
    return await this.commentService.uploadFile(file, commentId);
  }
}
