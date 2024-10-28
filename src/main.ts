import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  //Make use of swagger to create doc later ocee
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
