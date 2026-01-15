const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/expensesdb", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// ✅ Expense Schema
const expenseSchema = new mongoose.Schema(
  {
    expenseId: { type: String, required: true },
    date: { type: Date, required: true },
    category: {
      type: String,
      enum: ["Travel", "Meal", "Hotel", "Material"],
      required: true,
    },
    paymentMode: { type: String, enum: ["Cash", "Bank", "UPI"], required: true },
    paidBy: { type: String, required: true },
    approvalStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    remarks: { type: String },

    // ✅ Category-specific fields
    from: { type: String },
    to: { type: String },
    stay: { type: String },
    quantity: { type: Number },
    amount: { type: Number, required: true },
  },
  { timestamps: true }
);

const Expense = mongoose.model("Expense", expenseSchema);

// ✅ Get all expenses
app.get("/api/expenses", async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ createdAt: -1 });
    res.json(expenses);
  } catch (err) {
    console.error("Error fetching expenses:", err);
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
});

// ✅ Create new expense
app.post("/api/expenses", async (req, res) => {
  try {
    const {
      expenseId,
      date,
      category,
      paymentMode,
      paidBy,
      approvalStatus,
      remarks,
      from,
      to,
      stay,
      quantity,
      amount,
    } = req.body;

    const expense = new Expense({
      expenseId,
      date,
      category,
      paymentMode,
      paidBy,
      approvalStatus,
      remarks,
      from,
      to,
      stay,
      quantity,
      amount,
    });

    await expense.save();
    res.json(expense);
  } catch (err) {
    console.error("Error saving expense:", err);
    res.status(400).json({ error: err.message });
  }
});

// ✅ Update expense
app.put("/api/expenses/:id", async (req, res) => {
  try {
    const updated = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ error: "Expense not found" });
    res.json(updated);
  } catch (err) {
    console.error("Error updating expense:", err);
    res.status(400).json({ error: err.message });
  }
});

// ✅ Delete expense
app.delete("/api/expenses/:id", async (req, res) => {
  try {
    const deleted = await Expense.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Expense not found" });
    res.json({ message: "Deleted Successfully" });
  } catch (err) {
    console.error("Error deleting expense:", err);
    res.status(400).json({ error: err.message });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
