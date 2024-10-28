import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction } from 'src/transaction.interface';
import { User } from 'src/user.interface';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    @InjectModel('Transaction') private transactionModel: Model<Transaction>, // Inject transaction model
  ) {}

  // Get all users
  async findAllUsers(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  // Delete a user by ID
  async deleteUser(userId: string): Promise<void> {
    const user = await this.userModel.findByIdAndDelete(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
  }

  // Freeze or unfreeze a user account
  async freezeAccount(userId: string, freeze: boolean): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.isFrozen = freeze;
    return user.save();
  }

  // Update user information
  async updateUser(userId: string, updateUserDto: any): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(userId, updateUserDto, {
      new: true,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  // Update user balance
  async updateUserBalance(userId: string, newBalance: number): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (newBalance < 0) {
      throw new BadRequestException('Balance cannot be negative');
    }
    user.balance = newBalance;
    return user.save();
  }

  // Approve or decline transaction
  async handleTransactionApproval(
    transactionId: string,
    approve: boolean,
  ): Promise<Transaction> {
    const transaction = await this.transactionModel.findById(transactionId);
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    transaction.status = approve ? 'approved' : 'declined';
    return transaction.save();
  }
}
