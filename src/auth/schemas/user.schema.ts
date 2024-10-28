import { Schema } from 'mongoose';
export const UserSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  address: { type: String, required: true },
  ssn: { type: String, required: true },
  driversLicense: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  accountNumber: { type: String, unique: true, required: true },
  balance: { type: Number, default: 0 },
  currency: { type: String, default: 'USD' },
  roles: { type: [String], default: ['user'] },
  isFrozen: { type: Boolean, default: false }, // New field to indicate if account is frozen
  otp: { type: String }, // Add the OTP field here
  createdAt: { type: Date, default: Date.now },
});
