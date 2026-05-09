import mongoose from "mongoose";

const transcriptSchema = new mongoose.Schema({
  userId:    { type: String, required: true },
  username:  { type: String, required: true },
  debateId:  { type: String, required: true },
  speaker:   { type: String, required: true },
  round:     { type: Number, required: true },
  text:      { type: String, required: true },
  topic:     { type: String, default: "" },       // debate topic — used in /debates listing
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Transcript", transcriptSchema);