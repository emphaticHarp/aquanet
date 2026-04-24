import mongoose, { Schema, Document } from 'mongoose';
import bcryptjs from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  role: 'member' | 'admin' | 'researcher';
  resetOtp?: string;
  resetOtpExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ['member', 'admin', 'researcher'],
        message: 'Role must be member, admin, or researcher',
      },
      default: 'member',
    },
    resetOtp: {
      type: String,
      select: false,
    },
    resetOtpExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
  return await bcryptjs.compare(enteredPassword, this.password);
};

export default mongoose.models.User || mongoose.model<IUser>('User', userSchema);
