import mongoose, { Schema, Document } from 'mongoose';

export interface IPost extends Document {
  author: mongoose.Types.ObjectId;
  authorName: string;
  authorEmail: string;
  authorInitial: string;
  text: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  likes: mongoose.Types.ObjectId[];
  likesCount: number;
  comments: {
    _id: mongoose.Types.ObjectId;
    author: mongoose.Types.ObjectId;
    authorName: string;
    authorInitial: string;
    text: string;
    createdAt: Date;
  }[];
  shares: number;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    authorEmail: {
      type: String,
      required: true,
    },
    authorInitial: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    mediaUrl: {
      type: String,
      default: null,
    },
    mediaType: {
      type: String,
      enum: ['image', 'video'],
      default: null,
    },
    likes: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    likesCount: {
      type: Number,
      default: 0,
    },
    comments: [{
      author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      authorName: {
        type: String,
        required: true,
      },
      authorInitial: {
        type: String,
        required: true,
      },
      text: {
        type: String,
        required: true,
        maxlength: 1000,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
    shares: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index for faster queries
PostSchema.index({ createdAt: -1 });
PostSchema.index({ author: 1 });

export default mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);
