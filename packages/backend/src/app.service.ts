import { Injectable } from '@nestjs/common';
import { toto } from '@monorepo/shared';

@Injectable()
export class AppService {
  getHello(): string {
    console.log('i am there');

    return `Toto is ${toto}, right?`;
  }
}
