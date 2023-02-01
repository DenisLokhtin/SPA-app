import {
  Controller,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { SharpPipe } from './pipes/sharp.pipe';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fileStorage from './utils/fileStorage';
import { AuthGuard } from '../user/guards/user.guard';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @UseGuards(AuthGuard)
  @Post('upload/:id')
  @UseInterceptors(FileInterceptor('file', fileStorage.saveFileToStorage))
  async uploadFile(
    @UploadedFile(SharpPipe) file: string,
    @Param('id') commentId: number,
  ) {
    return await this.commentService.uploadFile(file, commentId);
  }
}
