import { Schema } from 'mongoose';

export const TransactionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // User reference is required
    amount: { type: Number, required: true },
    type: { type: String, enum: ['credit', 'debit'], required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'declined'],
      default: 'pending',
    },
    narration: { type: String, required: true },
  },
  { timestamps: true }, // Automatically create createdAt and updatedAt fields
);
