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
export class TransactionService {
  constructor(
    @InjectModel('Transaction') private transactionModel: Model<Transaction>,
    @InjectModel('User') private userModel: Model<User>,
  ) {}

  // Create a new transaction, automatically approving below 50,000
  async createTransaction(
    userId: string,
    amount: number,
    type: 'credit' | 'debit',
    narration: string,
    category: string,
  ): Promise<Transaction> {
    // Find the user by ID
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if the account is frozen
    if (user.isFrozen) {
      throw new BadRequestException('Account is frozen');
    }

    // Automatically approve transactions below 50,000
    let status: 'pending' | 'approved' = 'pending';
    if (amount < 50000) {
      status = 'approved';

      // Handle balance updates immediately for approved transactions
      if (type === 'credit') {
        user.balance += amount;
      } else if (type === 'debit') {
        if (user.balance < amount) {
          throw new BadRequestException('Insufficient funds');
        }
        user.balance -= amount;
      }

      // Save the updated balance
      await user.save();
    }

    // Create and save the transaction
    const transaction = new this.transactionModel({
      userId,
      amount,
      type,
      narration,
      status,
      category,
    });

    return transaction.save();
  }

  // Admin approval or decline of a transaction (for amounts above 50,000)
  async handleTransactionApproval(
    transactionId: string,
    approve: boolean,
  ): Promise<Transaction> {
    const transaction = await this.transactionModel.findById(transactionId);
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    // Find the user associated with the transaction
    const user = await this.userModel.findById(transaction.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (approve) {
      // Approve the transaction and adjust the user's balance
      if (transaction.type === 'credit') {
        user.balance += transaction.amount;
      } else if (transaction.type === 'debit') {
        if (user.balance < transaction.amount) {
          throw new BadRequestException('Insufficient funds');
        }
        user.balance -= transaction.amount;
      }

      transaction.status = 'approved';
    } else {
      // Decline the transaction, leave balance unchanged
      transaction.status = 'declined';
    }

    // Save the updated transaction status
    await transaction.save();

    return transaction;
  }

  // Get all transactions for admin
  async getAllTransactions(): Promise<Transaction[]> {
    return this.transactionModel.find().populate('userId').exec();
  }

  // Get all transactions for a specific user
  async getUserTransactions(userId: string): Promise<Transaction[]> {
    return this.transactionModel.find({ userId }).exec();
  }

  // Get transaction for category
  async getTransactionsByCategory(category: string): Promise<Transaction[]> {
    return this.transactionModel.find({ category }).exec();
  }
}
