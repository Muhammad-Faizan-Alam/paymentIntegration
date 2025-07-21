import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  stripeCustomerId: { type: String },
  subscription: {
    plan: { type: String, enum: ['basic', 'standard', 'premium'], default: null },
    status: { type: String },
    currentPeriodEnd: { type: Date },
    subscriptionId: { type: String },
  },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);