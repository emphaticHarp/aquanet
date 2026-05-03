import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  conversationId: string;
  sender: mongoose.Types.ObjectId;
  senderName: string;
  senderInitial: string;
  receiver: mongoose.Types.ObjectId;
  receiverName: string;
  text: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'file';
  fileName?: string;
  fileSize?: number;
  encrypted: boolean;
  read: boolean;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    senderInitial: {
      type: String,
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiverName: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: false,
      maxlength: 2000,
    },
    mediaUrl: {
      type: String,
      required: false,
    },
    mediaType: {
      type: String,
      enum: ['image', 'video', 'file'],
      required: false,
    },
    fileName: {
      type: String,
      required: false,
    },
    fileSize: {
      type: Number,
      required: false,
    },
    encrypted: {
      type: Boolean,
      default: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Indexes for faster queries
MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ receiver: 1, read: 1 });

export default mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);
