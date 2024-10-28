import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your_jwt_secret_key', // Use environment variable or fallback
      signOptions: { expiresIn: '3h' }, // Token expiration time
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [JwtModule], // Export JwtModule so it's accessible elsewhere
})
export class AuthModule {}
