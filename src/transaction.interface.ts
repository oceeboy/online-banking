import { Document } from 'mongoose';

export interface Transaction extends Document {
  _id: string;
  userId: string; // The user performing the transaction
  amount: number; // Transaction amount
  type: 'credit' | 'debit'; // Type of transaction: credit or debit
  status: 'pending' | 'approved' | 'declined'; // Transaction status
  narration: string; // A description or context for the transaction
  category: string; // To get it categories
  createdAt: Date; // Timestamp when the transaction was created
  updatedAt: Date; // Timestamp when the transaction was last updated
}
