import { createClient } from "@deepgram/sdk";
import "dotenv/config";

// 🔐 Validate API key at startup
if (!process.env.DEEPGRAM_API_KEY) {
  throw new Error("❌ DEEPGRAM_API_KEY missing in .env file");
}

// 🎙 Create Deepgram client
export const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

// 🧠 Debate-Optimized Transcription Options
export const DEBATE_OPTIONS = {
  model: "nova-2",

  language: "en-US",

  smart_format: true,   // Formats numbers, dates, etc.
  punctuate: true,      // Adds punctuation
  paragraphs: true,     // Groups into argument blocks
  utterances: true,     // Breaks by natural pauses
  utt_split: 0.8,       // 0.8 sec silence = new utterance

  filler_words: false,  // Removes "um", "uh"
  measurements: true,   // "5 km" not "five kilometers"

  diarize: false,       // Not needed (turn-based debate)
  detect_language: false, // Fixed language for accuracy
  alternatives: 1,      // Only best transcript (cost-efficient)
};
