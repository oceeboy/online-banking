import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('admin')
@UseGuards(AuthGuard) // Protect the routes for admin users
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Get all users
  @Get('users')
  async getAllUsers() {
    return this.adminService.findAllUsers();
  }

  // Delete a user
  @Delete('users/:userId')
  async deleteUser(@Param('userId') userId: string) {
    return this.adminService.deleteUser(userId);
  }

  // Freeze or unfreeze a user account
  @Patch('users/:userId/freeze')
  async freezeAccount(
    @Param('userId') userId: string,
    @Body('freeze') freeze: boolean,
  ) {
    return this.adminService.freezeAccount(userId, freeze);
  }

  // Update user information
  @Patch('users/:userId')
  async updateUser(
    @Param('userId') userId: string,
    @Body() updateUserDto: any,
  ) {
    return this.adminService.updateUser(userId, updateUserDto);
  }

  // Approve or decline a transaction
  @Patch('transactions/:transactionId/approve')
  async approveTransaction(
    @Param('transactionId') transactionId: string,
    @Body('approve') approve: boolean,
  ) {
    return this.adminService.handleTransactionApproval(transactionId, approve);
  }
}
