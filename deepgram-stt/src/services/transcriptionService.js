// src/services/transcriptionService.js
import fs from "fs";
import path from "path";
import { deepgram, DEBATE_OPTIONS } from "../config/deepgram.js";

export async function transcribeFile(filePath, meta = {}) {
  // --- Validate file exists ---
  if (!fs.existsSync(filePath)) {
    throw new Error(`Audio file not found: ${filePath}`);
  }

  const ext = path.extname(filePath).toLowerCase();
  const mimeMap = {
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".mp4": "audio/mp4",
    ".m4a": "audio/mp4",
    ".webm": "audio/webm",
    ".ogg": "audio/ogg",
  };

  const mimetype = mimeMap[ext];
  if (!mimetype) throw new Error(`Unsupported file type: ${ext}`);

  console.log(`\n📤 Sending to Deepgram: ${path.basename(filePath)}`);

  // --- Read & send to Deepgram ---
  const audioBuffer = fs.readFileSync(filePath);

  const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
    audioBuffer,
    { ...DEBATE_OPTIONS, mimetype }
  );

  if (error) throw new Error(`Deepgram error: ${error.message}`);
  if (!result) throw new Error("Deepgram returned an empty result");

  return parseDeepgramResult(result, meta);
}

function parseDeepgramResult(result, meta) {
  const channel = result.results?.channels?.[0];
  const alternative = channel?.alternatives?.[0];

  if (!alternative?.transcript) {
    throw new Error("No transcript found in Deepgram response — audio may be silent or too short");
  }

  // --- Full transcript text ---
  const fullText = alternative.transcript;

  // --- Paragraphs (best unit for claim extraction) ---
  const paragraphs = alternative.paragraphs?.paragraphs?.map((p, i) => ({
    index: i,
    text: p.sentences?.map((s) => s.text).join(" ").trim(),
    sentences: p.sentences?.map((s) => ({ text: s.text, start: s.start, end: s.end })),
    start: p.start,
    end: p.end,
  })) ?? [];

  // --- Utterances (natural speech chunks, good for turn detection) ---
  const utterances = result.results?.utterances?.map((u, i) => ({
    index: i,
    text: u.transcript,
    confidence: parseFloat(u.confidence.toFixed(3)),
    start: u.start,
    end: u.end,
    duration: parseFloat((u.end - u.start).toFixed(2)),
  })) ?? [];

  // --- Word-level detail (useful for confidence analysis) ---
  const words = alternative.words?.map((w) => ({
    word: w.word,
    confidence: w.confidence,
    start: w.start,
    end: w.end,
  })) ?? [];

  // --- Stats ---
  const avgConfidence = words.length
    ? parseFloat((words.reduce((sum, w) => sum + w.confidence, 0) / words.length).toFixed(3))
    : 0;

  const lowConfidenceWords = words.filter((w) => w.confidence < 0.75);
  const totalDuration = words.at(-1)?.end ?? 0;

  // --- Flag potentially bad audio quality ---
  const qualityWarnings = [];
  if (avgConfidence < 0.80) qualityWarnings.push("Low average confidence — audio quality may be poor");
  if (lowConfidenceWords.length / words.length > 0.2) qualityWarnings.push("More than 20% of words have low confidence");
  if (paragraphs.length === 0) qualityWarnings.push("No paragraphs detected — speech may be very short");

  return {
    // Metadata
    speakerId: meta.speakerId ?? "unknown",
    debateId: meta.debateId ?? "unknown",
    filename: meta.filename ?? "unknown",
    transcribedAt: new Date().toISOString(),

    // Core output
    fullText,
    paragraphs,
    utterances,
    words,

    // Stats
    stats: {
      wordCount: words.length,
      paragraphCount: paragraphs.length,
      utteranceCount: utterances.length,
      avgConfidence,
      lowConfidenceWordCount: lowConfidenceWords.length,
      durationSeconds: parseFloat(totalDuration.toFixed(2)),
    },

    // Warnings
    qualityWarnings,
  };
}