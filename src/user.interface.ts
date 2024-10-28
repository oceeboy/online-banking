import { Document } from 'mongoose'; // Import Document from Mongoose

export interface User extends Document {
  // Extend from Document
  _id: string; // Or ObjectId if you're using ObjectId directly from MongoDB
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  address: string;
  ssn: string;
  driversLicense: string;
  email: string;
  password: string;
  accountNumber: number;
  balance: number;
  currency: string;
  roles: string[]; // Add roles
  isFrozen: boolean;
  otp?: string; // Optional OTP field
  createdAt: Date;
}
