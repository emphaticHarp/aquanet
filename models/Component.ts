import mongoose, { Schema, Document } from 'mongoose';

export interface IComponent extends Document {
  name: string;
  category: string;
  status: 'ordered' | 'not-ordered' | 'in-use' | 'maintenance';
  productLink?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  addedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const ComponentSchema = new Schema<IComponent>(
  {
    name:     { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['ordered', 'not-ordered', 'in-use', 'maintenance'],
      default: 'not-ordered',
    },
    productLink: { type: String, trim: true },
    quantity:   { type: Number, required: true, default: 1 },
    unitPrice:  { type: Number, required: true, default: 0 },
    totalPrice: { type: Number, required: true, default: 0 },
    addedBy:    { type: String, required: true },
  },
  { timestamps: true }
);

// Delete cached model to force schema refresh
if (mongoose.models.Component) {
  delete mongoose.models.Component;
}

export default mongoose.model<IComponent>('Component', ComponentSchema);
