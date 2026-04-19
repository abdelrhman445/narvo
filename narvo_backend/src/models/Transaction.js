const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: {
        values: ['IN', 'OUT'],
        message: 'Transaction type must be either IN or OUT',
      },
      required: [true, 'Transaction type is required'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be a positive number'],
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      // Can reference an Order or any other document
    },
    referenceModel: {
      type: String,
      enum: ['Order', null],
      default: null,
    },
    note: {
      type: String,
      trim: true,
      maxlength: [500, 'Note cannot exceed 500 characters'],
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes for financial reports
transactionSchema.index({ type: 1, createdAt: -1 });
transactionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
