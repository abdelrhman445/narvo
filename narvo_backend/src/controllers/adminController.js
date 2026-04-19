const { z } = require('zod');
const Transaction = require('../models/Transaction');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

const expenseSchema = z.object({
  amount: z
    .number({ invalid_type_error: 'Amount must be a number' })
    .positive('Amount must be a positive number')
    .max(10_000_000, 'Amount exceeds maximum allowed'),
  note: z
    .string()
    .min(3, 'Note must be at least 3 characters')
    .max(500, 'Note cannot exceed 500 characters'),
  referenceId: z.string().optional().nullable(),
});

const reportQuerySchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * POST /api/admin/finance/expense
 * Add an OUT (expense) record to the ledger
 */
const addExpense = asyncHandler(async (req, res) => {
  const { amount, note, referenceId } = expenseSchema.parse(req.body);

  const transaction = await Transaction.create({
    type: 'OUT',
    amount,
    note,
    referenceId: referenceId || null,
    createdBy: req.admin.id,
  });

  res.status(201).json({
    success: true,
    message: 'Expense recorded successfully.',
    data: transaction,
  });
});

/**
 * GET /api/admin/finance/report
 * Calculate financial summary: Total IN - Total OUT = Net Profit/Loss
 * Supports optional date range filtering
 */
const getFinancialReport = asyncHandler(async (req, res) => {
  const { startDate, endDate, page, limit } = reportQuerySchema.parse(req.query);

  // Build date filter
  const dateFilter = {};
  if (startDate || endDate) {
    dateFilter.createdAt = {};
    if (startDate) dateFilter.createdAt.$gte = startDate;
    if (endDate) {
      // Set endDate to end of day
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.createdAt.$lte = end;
    }
  }

  // Aggregate totals efficiently in a single pipeline
  const [aggregation] = await Transaction.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: null,
        totalIN: {
          $sum: {
            $cond: [{ $eq: ['$type', 'IN'] }, '$amount', 0],
          },
        },
        totalOUT: {
          $sum: {
            $cond: [{ $eq: ['$type', 'OUT'] }, '$amount', 0],
          },
        },
        countIN: {
          $sum: { $cond: [{ $eq: ['$type', 'IN'] }, 1, 0] },
        },
        countOUT: {
          $sum: { $cond: [{ $eq: ['$type', 'OUT'] }, 1, 0] },
        },
      },
    },
  ]);

  const totalIN = aggregation?.totalIN || 0;
  const totalOUT = aggregation?.totalOUT || 0;
  const netBalance = parseFloat((totalIN - totalOUT).toFixed(2));

  // Paginated transaction history
  const skip = (page - 1) * limit;
  const [transactions, totalTransactions] = await Promise.all([
    Transaction.find(dateFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'username'),
    Transaction.countDocuments(dateFilter),
  ]);

  res.status(200).json({
    success: true,
    data: {
      summary: {
        totalIN: parseFloat(totalIN.toFixed(2)),
        totalOUT: parseFloat(totalOUT.toFixed(2)),
        netBalance,
        status: netBalance >= 0 ? 'PROFIT' : 'LOSS',
        countIN: aggregation?.countIN || 0,
        countOUT: aggregation?.countOUT || 0,
        period: {
          from: startDate || 'All time',
          to: endDate || 'All time',
        },
      },
      transactions,
      pagination: {
        page,
        limit,
        total: totalTransactions,
        totalPages: Math.ceil(totalTransactions / limit),
      },
    },
  });
});

module.exports = { addExpense, getFinancialReport };
