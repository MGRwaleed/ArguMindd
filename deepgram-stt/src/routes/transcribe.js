import express from "express";
import multer from "multer";
import path from "path";
import crypto from "crypto";
import fs from "fs";
import { transcribeFile } from "../services/transcriptionService.js";

const router = express.Router();

// 📂 Configure file storage
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const uniqueId = crypto.randomBytes(6).toString("hex");
    cb(null, `${uniqueId}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  // fileFilter: (req, file, cb) => {
  //   const allowedTypes = [
  //     "audio/mpeg",
  //     "audio/wav",
  //     "audio/mp4",
  //     "audio/webm",
  //     "audio/ogg",
  //   ];

  //   if (allowedTypes.includes(file.mimetype)) {
  //     cb(null, true);
  //   } else {
  //     cb(new Error("Unsupported file type"));
  //   }
  // },

  fileFilter: (req, file, cb) => {
  const allowedExtensions = [".mp3", ".wav", ".mp4", ".m4a", ".webm", ".ogg"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type"));
  }
  },

  
});

// 🎙 POST /api/transcribe
router.post("/", upload.single("audio"), async (req, res) => {
  const { speakerId, debateId } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: "No audio file uploaded" });
  }

  if (!speakerId || !debateId) {
    return res.status(400).json({ error: "speakerId and debateId are required" });
  }

  try {
    const transcript = await transcribeFile(req.file.path, {
      speakerId,
      debateId,
      filename: req.file.originalname,
    });

    // 🗑 Delete uploaded file after processing
    await fs.promises.unlink(req.file.path).catch(() => {});

    res.json({
      success: true,
      transcript,
    });

  } catch (error) {
    await fs.promises.unlink(req.file.path).catch(() => {});
    res.status(500).json({ error: error.message });
  }
});

export default router;
