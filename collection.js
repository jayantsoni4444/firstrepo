const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// ---------------- MongoDB ----------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log(err));

// ---------------- FILE UPLOAD ----------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|pdf/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    if (ext) cb(null, true);
    else cb("Only images & PDFs allowed");
  },
});

// Serve uploaded files
app.use("/uploads", express.static("uploads"));

// ---------------- SCHEMA ----------------
const paymentSchema = new mongoose.Schema({
  date: String,
  amount: Number,
  invoiceAmount: Number,
  paymentMode: String,
  remarks: String,
  status: String,
});


const entrySchema = new mongoose.Schema({
  name: String,
  location: String,
  party: String,
  paymentMode: String,
  payments: [paymentSchema], // ✅ multiple payments
  remarks: String,
  invoiceNumber: Number,
  orderdate: String,
  dispatchRemarks: String,
  invoiceFile: String,       // ✅ image / pdf
  dispatch: String,
});

const Entry = mongoose.model("Entry", entrySchema);

// ---------------- ROUTES ----------------

// GET all entries
app.get("/entries", async (req, res) => {
  const data = await Entry.find();
  res.json(data);
});

// CREATE entry
app.post("/entries", upload.single("invoiceFile"), async (req, res) => {
  const payments = JSON.parse(req.body.payments || "[]");

  const entry = new Entry({
    name: req.body.name,
    location: req.body.location,
    party: req.body.party,
    paymentMode: req.body.paymentMode,
    payments,
    invoiceNumber: req.body.invoiceNumber, // ✅ ADD THIS
    orderdate: req.body.orderdate, // ✅ ADD THIS
    remarks: req.body.remarks,
    dispatchRemarks: req.body.dispatchRemarks,
    dispatch: req.body.dispatch,
    invoiceFile: req.file ? `uploads/${req.file.filename}` : "",
  });

  const saved = await entry.save();
  res.json(saved);
});

// UPDATE entry
app.put("/entries/:id", upload.single("invoiceFile"), async (req, res) => {
  const payments = JSON.parse(req.body.payments || "[]");

  const updatedData = {
    name: req.body.name,
    location: req.body.location,
    party: req.body.party,
    paymentMode: req.body.paymentMode,
    orderdate: req.body.orderdate,
    invoiceNumber: req.body.invoiceNumber,
    dispatchRemarks: req.body.dispatchRemarks,
    payments,
    remarks: req.body.remarks,
    dispatch: req.body.dispatch,
  };

  if (req.file) {
    updatedData.invoiceFile = `uploads/${req.file.filename}`;
  }

  const updated = await Entry.findByIdAndUpdate(
    req.params.id,
    updatedData,
    { new: true }
  );

  res.json(updated);
});

// DELETE entry
app.delete("/entries/:id", async (req, res) => {
  await Entry.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted Successfully" });
});

// ---------------- START SERVER ----------------
app.listen(5000, () =>
  console.log("🚀 Server running on http://localhost:5000")
);
