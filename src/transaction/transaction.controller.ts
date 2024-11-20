import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';

@ApiTags('Transactions') // Group under 'Transactions' in Swagger
@ApiBearerAuth() // Indicate the need for authentication
@Controller('transactions')
@UseGuards(AuthGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiResponse({
    status: 201,
    description: 'The transaction has been successfully created.',
    schema: {
      example: {
        _id: '673ca10dfc99dcd166dadda1',
        userId: '671f699164930ae9378b9e0e',
        amount: 500000,
        type: 'credit',
        narration: 'riceee bag',
        category: 'food',
        status: 'pending',
        createdAt: '2024-11-19T14:30:37.342Z',
        updatedAt: '2024-11-19T14:30:37.342Z',
      },
    },
  })
  createTransaction(
    @Request() req,
    @Body('amount') amount: number,
    @Body('type') type: 'credit' | 'debit',
    @Body('narration') narration: string,
    @Body('category') category: string,
  ) {
    return this.transactionService.createTransaction(
      req.user.sub,
      amount,
      type,
      narration,
      category,
    );
  }

  @Get('/category/:category')
  @ApiOperation({ summary: 'Get transactions filtered by category' })
  @ApiParam({ name: 'category', description: 'Category of the transaction' })
  async getTransactionsByCategory(
    @Request() req,
    @Param('category') category: string,
  ) {
    const user = req.user;
    const transactionCat = await this.transactionService.getUserTransactions(
      user.sub,
    );
    const categoryData = transactionCat.filter((t) => t.category === category);
    return categoryData;
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all transactions for a specific user' })
  @ApiParam({ name: 'userId', description: 'ID of the user' })
  getUserTransactions(@Param('userId') userId: string) {
    return this.transactionService.getUserTransactions(userId);
  }
}

// @Get('/category/:category')
// async getTransactionsByCategory(
//   @Request() req,
//   @Param('category') category: string,
// ) {
//   const user = req.user;

//   const transactionCat = await this.transactionService.getUserTransactions(
//     user.sub,
//   );

//   const categoryData = transactionCat.filter((t) => t.category === category);

//   return categoryData;
// }
