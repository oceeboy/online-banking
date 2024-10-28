import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminModule } from './admin/admin.module'; // Import AdminModule

import { TransactionModule } from './transaction/transaction.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URI), // Use environment variable for MongoDB URI
    AuthModule,
    AdminModule,
    TransactionModule, // Import AdminModule here
  ],
  controllers: [AppController], // Only AppController here
  providers: [AppService], // Only AppService here
})
export class AppModule {}
