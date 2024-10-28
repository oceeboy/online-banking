import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as CryptoJS from 'crypto-js';
import { JwtService } from '@nestjs/jwt';
import * as nodemailer from 'nodemailer';

import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from 'src/user.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  // Register a new user
  async registerUser(data: RegisterUserDto) {
    const { email, password, ssn, driversLicense, ...rest } = data;

    // Check if the email already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a unique numeric account number
    const accountNumber = await this.generateUniqueAccountNumber();

    // Encrypt SSN and driver's license
    const encryptedSSN = this.encryptData(ssn);
    const encryptedDriversLicense = this.encryptData(driversLicense);

    // Create the user and their account details
    const newUser = new this.userModel({
      ...rest,
      email,
      password: hashedPassword,
      accountNumber,
      balance: 0,
      currency: 'USD',
      ssn: encryptedSSN,
      driversLicense: encryptedDriversLicense,
    });

    const savedUser = await newUser.save();

    // Generate both access and refresh tokens
    const accessToken = this.generateJwtToken(savedUser);
    const refreshToken = this.generateRefreshToken(savedUser);

    return {
      user: savedUser,
      accessToken, // Return the access token
      refreshToken, // Return the refresh token
    };
  }

  // Login user
  async loginUser(
    loginUserDto: LoginUserDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { email, password } = loginUserDto;

    // Find the user by email
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate both access and refresh tokens
    const accessToken = this.generateJwtToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return { accessToken, refreshToken };
  }

  // Generate access token
  generateJwtToken(user: User): string {
    const payload = { email: user.email, sub: user._id, roles: user.roles };
    return this.jwtService.sign(payload, { expiresIn: '15m' }); // Short-lived access token
  }

  // Generate refresh token
  generateRefreshToken(user: User): string {
    const payload = { sub: user._id };
    return this.jwtService.sign(payload, { expiresIn: '7d' }); // Longer-lived refresh token
  }

  // Refresh access token using refresh token
  async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      const decoded = this.jwtService.verify(refreshToken);
      const user = await this.userModel.findById(decoded.sub);
      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      return this.generateJwtToken(user);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: unknown) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  // Generate OTP for password reset
  async generateOtp(email: string): Promise<string> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Email not found');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit OTP

    // Send OTP to user's email (using nodemailer for email sending)
    await this.sendOtpEmail(user.email, otp);

    // Store the OTP temporarily (e.g., in the user's document or a cache)
    user.otp = otp;
    await user.save();

    return 'OTP sent to your email';
  }

  // Send OTP via email
  async sendOtpEmail(email: string, otp: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL, // Your email
        pass: process.env.EMAIL_PASSWORD, // Your email password
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is: ${otp}`,
    });
  }

  // Verify OTP and allow password reset
  async verifyOtp(email: string, otp: string, newPassword: string) {
    const user = await this.userModel.findOne({ email });
    if (!user || user.otp !== otp) {
      throw new UnauthorizedException('Invalid OTP');
    }

    // Hash the new password and update
    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = undefined; // Clear the OTP
    await user.save();

    return 'Password updated successfully';
  }

  // Encrypt sensitive data using crypto-js
  encryptData(data: string): string {
    const secretKey = process.env.ENCRYPTION_KEY || 'default_secret_key';
    return CryptoJS.AES.encrypt(data, secretKey).toString();
  }

  // Generate a unique numeric account number
  async generateUniqueAccountNumber(): Promise<number> {
    let accountNumber: number;
    let isUnique = false;

    while (!isUnique) {
      accountNumber = Math.floor(100000000 + Math.random() * 900000000); // 9 digits
      const existingUser = await this.userModel.findOne({ accountNumber });
      if (!existingUser) {
        isUnique = true;
      }
    }

    return accountNumber;
  }
}
