import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aquanet';

const ComponentSchema = new mongoose.Schema({
  name: String,
  category: String,
  status: String,
  productLink: String,
  quantity: Number,
  unitPrice: Number,
  totalPrice: Number,
  addedBy: String,
}, { timestamps: true });

const Component = mongoose.models.Component || mongoose.model('Component', ComponentSchema);

async function fixPrices() {
  console.log('🔌 Connecting...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected!\n');

  const components = await Component.find({});
  console.log(`Found ${components.length} components\n`);

  let fixed = 0;
  for (const comp of components) {
    const qty = comp.quantity || 1;
    const unitPrice = comp.unitPrice || 0;
    const correctTotal = qty * unitPrice;

    if (comp.totalPrice !== correctTotal) {
      comp.totalPrice = correctTotal;
      await comp.save();
      console.log(`✅ Fixed: ${comp.name} → qty:${qty} × ₹${unitPrice} = ₹${correctTotal}`);
      fixed++;
    }
  }

  console.log(`\n✨ Fixed ${fixed} components`);

  // Show grand total
  const all = await Component.find({});
  const grandTotal = all.reduce((s: number, c: any) => s + (c.totalPrice || 0), 0);
  console.log(`💰 Grand Total: ₹${grandTotal.toLocaleString('en-IN')}`);

  await mongoose.disconnect();
  process.exit(0);
}

fixPrices().catch(err => { console.error(err); process.exit(1); });
