import express from "express";
import "dotenv/config";
import transcribeRouter from "./routes/transcribe.js";

const app = express();

app.use(express.json());

// 🎙 Route registration
app.use("/api/transcribe", transcribeRouter);

app.listen(process.env.PORT || 3001, () => {
  console.log(`🚀 Server running on port ${process.env.PORT || 3001}`);
});
