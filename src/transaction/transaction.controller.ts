import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('transactions')
@UseGuards(AuthGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  // Create a new transaction (accessible to both users and admins)

  @Post()
  async createTransaction(
    @Request() req, // This will contain the authenticated user's details
    @Body('amount') amount: number,
    @Body('type') type: 'credit' | 'debit',
    @Body('narration') narration: string,
  ) {
    console.log(req.user);
    const userId = req.user.sub; // Extract the user ID from the authenticated user
    return this.transactionService.createTransaction(
      userId,
      amount,
      type,
      narration,
    );
  }

  // Get all transactions for a specific user (User)
  @Get('user/:userId')
  async getUserTransactions(@Param('userId') userId: string) {
    return this.transactionService.getUserTransactions(userId);
  }

  // Approve or decline a transaction (Admin)
  @Patch(':transactionId/approve')
  async approveTransaction(
    @Param('transactionId') transactionId: string,
    @Body('approve') approve: boolean,
  ) {
    return this.transactionService.handleTransactionApproval(
      transactionId,
      approve,
    );
  }

  // Get all transactions (Admin)
  @Get()
  async getTransactions(@Request() req) {
    const user = req.user;
    console.log(user);
    if (user.roles.includes('admin')) {
      // Admin can see all transactions
      return this.transactionService.getAllTransactions();
    } else {
      // Regular user can only see their own transactions
      return this.transactionService.getUserTransactions(user.sub); // Use user.sub as userId
    }
  }
}
