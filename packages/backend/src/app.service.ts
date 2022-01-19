import { toto } from '@monorepo/shared';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    console.log('i am there');

    return toto;
  }
}
