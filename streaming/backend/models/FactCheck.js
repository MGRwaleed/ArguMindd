import mongoose from "mongoose";

const factCheckSchema = new mongoose.Schema({
  userId:       { type: String, required: true },
  username:     { type: String, required: true },
  debateId:     { type: String, required: true },
  speaker:      { type: String, required: true },   // "speaker1" | "speaker2" — used for summary queries
  round:        { type: Number, required: true },
  claim:        { type: String, required: true },
  verdict:      { type: String, default: "UNVERIFIED" },
  confidence:   { type: Number, default: 0.5 },
  score:        { type: Number, default: 50 },
  performance:  { type: String, default: "Moderate" },
  trueCount:    { type: Number, default: 0 },
  falseCount:   { type: Number, default: 0 },
  partialCount: { type: Number, default: 0 },
  totalClaims:  { type: Number, default: 0 },
  reasoning:    { type: String, default: "" },
  createdAt:    { type: Date, default: Date.now },
});

export default mongoose.model("FactCheck", factCheckSchema);