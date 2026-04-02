// server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// =======================
// 🔧 Middleware
// =======================
app.use(cors());
app.use(express.json({ limit: "5mb" }));

// =======================
// ⚙️ MongoDB Connection
// =======================
const MONGO_URI =
  process.env.MONGODB_URI ||
//   "mongodb+srv://jayantsoni4382:js%4work@cluster0.mongodb.net/placementDB";
  // "mongodb+srv://khushsoni839:<db_password>@cluster0.zbjae.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
  "mongodb+srv://khushsoni839:ks1234@cluster0.u3hib.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// =======================
// 🧩 Mongoose Schemas
// =======================
const jobSchema = new mongoose.Schema(
  {
    role: { type: String, required: true },
    salary: { type: String, required: true },
    description: { type: String },
    skills: { type: String },
    experience: { type: String },
    education: { type: String },

    // 🆕 Added Fields
    jobType: { type: String, enum: ["Full Time", "Part Time"], required: true },
    location: { type: String, required: true },
    timing: { type: String, required: true }, // e.g. "9 AM - 5 PM"
    postDate: { type: Date,  },
  },
  { timestamps: true }
);

const applicantSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: String,
    address: String,
    note: String,
  },
  { timestamps: true }
);

const Job = mongoose.model("Job", jobSchema);
const Applicant = mongoose.model("Applicant", applicantSchema);

// =======================
// 📌 JOB ROUTES
// =======================

// Get all jobs
app.get("/api/jobs", async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single job by ID
app.get("/api/jobs/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new job
// app.post("/api/jobs", async (req, res) => {
//   try {
//     const { role, salary, description, skills, experience, education } = req.body;
//     if (!role || !salary) {
//       return res.status(400).json({ message: "Role and Salary are required" });
//     }
//     const job = new Job({ role, salary, description, skills, experience, education });
//     await job.save();
//     res.status(201).json(job);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

app.post("/api/jobs", async (req, res) => {
  try {
    const {
      role,
      salary,
      description,
      skills,
      experience,
      education,
      jobType,
      location,
      timing,
      postDate,
    } = req.body;

    if (!role || !salary || !jobType || !location || !timing) {
      return res.status(400).json({ message: "All required fields missing" });
    }

    const job = new Job({
      role,
      salary,
      description,
      skills,
      experience,
      education,
      jobType,
      location,
      timing,
      postDate,
    });

    await job.save();
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update job
app.put("/api/jobs/:id", async (req, res) => {
  try {
    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedJob) return res.status(404).json({ message: "Job not found" });
    res.json(updatedJob);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete job
app.delete("/api/jobs/:id", async (req, res) => {
  try {
    const deleted = await Job.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Job not found" });
    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// =======================
// 📩 APPLICANT ROUTES
// =======================
app.post("/api/applicants", async (req, res) => {
  try {
    const { jobId, name, phone, email, address, note } = req.body;
    if (!name || !phone)
      return res.status(400).json({ message: "Name and phone required" });
    const applicant = new Applicant({ jobId, name, phone, email, address, note });
    await applicant.save();
    res.status(201).json(applicant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/applicants", async (req, res) => {
  try {
    const applicants = await Applicant.find().sort({ createdAt: -1 });
    res.json(applicants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// =======================
// 🌐 Home route
// =======================
app.get("/", (req, res) => {
  res.send("💼 Job Placement API is running...");
});

// =======================
// 🚀 Server
// =======================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
