const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

/* =======================
   MongoDB Connection
======================= */
mongoose.connect(
  "mongodb+srv://ages27771:ages12345@cluster0.t2zpj0w.mongodb.net/partyDB",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
).then(() => console.log("MongoDB Connected"))
 .catch(err => console.log(err));

/* =======================
   Schemas & Models
======================= */
const entrySchema = new mongoose.Schema({
  date: String,
  amount: Number,
});

const partySchema = new mongoose.Schema({
  name: String,
  phone: String,
  location: String,
  gst: String,
  salesperson: String,
  entries: [entrySchema],
});

const Party = mongoose.model("Party", partySchema);

/* =======================
   Party APIs
======================= */

// Get all parties
app.get("/parties", async (req, res) => {
  const parties = await Party.find();
  res.json(parties);
});

// Create party
app.post("/parties", async (req, res) => {
  const party = new Party({
    name: req.body.name,
    phone: req.body.phone,
    location: req.body.location,
    gst: req.body.gst,
    salesperson: req.body.salesperson,
    entries: [],
  });

  await party.save();
  res.json(party);
});

// Update party
app.put("/parties/:id", async (req, res) => {
  const party = await Party.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      phone: req.body.phone,
      location: req.body.location,
      gst: req.body.gst,
      salesperson: req.body.salesperson,
    },
    { new: true }
  );
  res.json(party);
});

// Delete party
app.delete("/parties/:id", async (req, res) => {
  await Party.findByIdAndDelete(req.params.id);
  res.json({ message: "Party deleted successfully" });
});

/* =======================
   Entry APIs
======================= */

// Add entry
app.post("/parties/:id/entries", async (req, res) => {
  const party = await Party.findById(req.params.id);
  party.entries.push({
    date: req.body.date,
    amount: req.body.amount,
  });
  await party.save();
  res.json(party);
});

// Update entry
app.put("/parties/:id/entries/:entryId", async (req, res) => {
  const party = await Party.findById(req.params.id);
  const entry = party.entries.id(req.params.entryId);

  entry.date = req.body.date;
  entry.amount = req.body.amount;

  await party.save();
  res.json(party);
});

// Delete entry
app.delete("/parties/:id/entries/:entryId", async (req, res) => {
  const party = await Party.findById(req.params.id);

  if (!party) {
    return res.status(404).json({ message: "Party not found" });
  }

  party.entries.pull(req.params.entryId);
  await party.save();

  res.json(party); // return updated party
});


/* =======================
   Server Start
======================= */
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
