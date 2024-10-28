import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'EveryThing BacKEND <h1> good</h1>';
  }
}
