import { Injectable } from '@nestjs/common';
import { toto } from '@monorepo/shared';

@Injectable()
export class AppService {
  getHello(): string {
    return toto;
  }
}
