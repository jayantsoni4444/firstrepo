// server.js (One Page Backend for Sales Register with Atlas)

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5003;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Atlas connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Schema
const salesSchema = new mongoose.Schema({
  invoiceNo: String,
  date: String,
  customer: String,
  quantity: Number,
  rate: Number,
  total: Number,
  discount: Number,
  netAmount: Number,
  paymentStatus: { type: String, default: "Pending" },
  remarks: String,
});

// Model
const Sale = mongoose.model("Sale", salesSchema);

// Routes

// Get all sales
app.get("/api/sales", async (req, res) => {
  try {
    const sales = await Sale.find();
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new sale
app.post("/api/sales", async (req, res) => {
  try {
    const sale = new Sale(req.body);
    await sale.save();
    res.json(sale);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update sale
app.put("/api/sales/:id", async (req, res) => {
  try {
    const updatedSale = await Sale.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updatedSale);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete sale
app.delete("/api/sales/:id", async (req, res) => {
  try {
    await Sale.findByIdAndDelete(req.params.id);
    res.json({ message: "Sale deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
