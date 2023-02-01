import { ConflictException, Injectable, PipeTransform } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as sharp from 'sharp';
import typesDictionary from '../utils/typesDictionary';
import { writeFile } from 'fs';

@Injectable()
export class SharpPipe
  implements PipeTransform<Express.Multer.File, Promise<string>>
{
  async transform(file: Express.Multer.File): Promise<any> {
    if (!file) throw new ConflictException('type not found');
    const extension = typesDictionary[file.mimetype];

    const filename = uuidv4() + extension;
    if (file.size <= 1000000) {
      if (extension !== '.txt') {
        await sharp(file.buffer)
          .resize(320, 240)
          .toFile(path.join('files', filename));
      } else {
        writeFile('files/' + filename, file.buffer, (err) => {
          if (err) {
            console.error(err);
          }
        });
      }
      return filename;
    }
    throw new ConflictException('file not valid');
  }
}
