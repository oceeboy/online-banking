import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto'; // DTO to validate user input
import { LoginUserDto } from './dto/login-user.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async registerUser(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.registerUser(registerUserDto);
  }

  @Post('login')
  async loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.loginUser(loginUserDto);
  }
  @Post('refresh-token')
  async refreshAccessToken(@Body() refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;
    const newAccessToken =
      await this.authService.refreshAccessToken(refreshToken);
    if (!newAccessToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return { accessToken: newAccessToken };
  }

  // Request OTP for password reset
  @Post('forgot-password')
  async requestOtp(@Body() forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;
    return this.authService.generateOtp(email);
  }

  // Verify OTP and reset password
  @Post('verify-otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    const { email, otp, newPassword } = verifyOtpDto;
    return this.authService.verifyOtp(email, otp, newPassword);
  }
}
