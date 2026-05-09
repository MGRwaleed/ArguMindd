import dotenv from "dotenv";
dotenv.config();
import connectDB from "./db/mongo.js";
connectDB();

import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import Transcript from "./models/Transcript.js";
import FactCheck from "./models/FactCheck.js";

// ─── Inline DeepSummary model (cached AI summary per debate) ───────────────
import mongoose from "mongoose";
const deepSummarySchema = new mongoose.Schema({
  debateId: { type: String, required: true, unique: true },
  data:     { type: mongoose.Schema.Types.Mixed, required: true },
  createdAt:{ type: Date, default: Date.now },
});
const DeepSummary = mongoose.models.DeepSummary || mongoose.model("DeepSummary", deepSummarySchema);

async function deepgramTranscribe(buffer, lang, attempt = 1) {
  const params = new URLSearchParams({ model: "nova-3", language: lang, smart_format: "true", punctuate: "true" });
  try {
    const res = await fetch(`https://api.deepgram.com/v1/listen?${params}`, {
      method: "POST",
      headers: { "Authorization": `Token ${process.env.DEEPGRAM_API_KEY}`, "Content-Type": "audio/webm;codecs=opus" },
      body: buffer,
    });
    return res.json();
  } catch (err) {
    if (attempt < 3) {
      console.warn(`⚠️ Deepgram attempt ${attempt} failed (${err.message}), retrying in 2s…`);
      await new Promise(r => setTimeout(r, 2000));
      return deepgramTranscribe(buffer, lang, attempt + 1);
    }
    throw err;
  }
}

const app = express();
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://app.argumind.space',
    'https://stream.argumind.space'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
  pingInterval: 10000,
  pingTimeout: 5000,
  allowEIO3: true,
});

const ALLOWED_ORIGINS = [
  "http://localhost:5173",   // dashboard (dev)
  "http://localhost:5174",   // streaming (dev)

  "https://app.argumind.com",
  "https://stream.argumind.com"
];
// app.use(cors({
//   origin: (origin, callback) => {
//     if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
//     callback(new Error(`CORS blocked: ${origin}`));
//   },
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"],
// }));
app.use(express.json());
app.get("/", (req, res) => res.send("Backend working"));

// ─── GET /debates ──────────────────────────────────────────────────────────
app.get("/debates", async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = userId ? { userId } : {};
    const debateIds = await FactCheck.distinct("debateId", filter);
    const debates = await Promise.all(debateIds.map(async (debateId) => {
      const factchecks = await FactCheck.find({ debateId }).sort({ round: 1 });
      const s1 = factchecks.filter(f => f.speaker === "speaker1");
      const s2 = factchecks.filter(f => f.speaker === "speaker2");
      const avg = (arr) => arr.length ? arr.reduce((sum, f) => sum + (f.score || 0), 0) / arr.length : 0;
      const speaker1Avg = Math.round(avg(s1));
      const speaker2Avg = Math.round(avg(s2));

      // Resolve per-speaker identity from FactCheck records
      const speaker1UserId   = s1[0]?.userId   || null;
      const speaker1Username = s1[0]?.username  || null;
      const speaker2UserId   = s2[0]?.userId    || null;
      const speaker2Username = s2[0]?.username  || null;

      // Winner is the userId of the higher scorer, null for draw
      const winnerUserId = speaker1Avg > speaker2Avg ? speaker1UserId
                         : speaker2Avg > speaker1Avg ? speaker2UserId
                         : null;

      // Fetch topic from first transcript of this debate
      const firstTranscript = await Transcript.findOne({ debateId }).sort({ createdAt: 1 }).lean();
      const topic = firstTranscript?.topic || null;

      return {
        debateId,
        createdAt:       factchecks[0]?.createdAt || null,
        speaker1Avg,     speaker2Avg,
        speaker1UserId,  speaker1Username,
        speaker2UserId,  speaker2Username,
        winnerUserId,
        winner: speaker1Avg > speaker2Avg ? "speaker1" : speaker2Avg > speaker1Avg ? "speaker2" : "Draw",
        roundCount: Math.max(...factchecks.map(f => f.round || 0), 0),
        topic,
      };
    }));
    debates.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(debates);
  } catch (err) {
    console.error("GET /debates error:", err);
    res.status(500).json({ error: "Failed to fetch debates" });
  }
});

app.get("/transcripts/:roomId", async (req, res) => {
  try {
    const transcripts = await Transcript.find({ debateId: req.params.roomId }).sort({ round: 1, speaker: 1 });
    res.json(transcripts);
  } catch (err) { res.status(500).json({ error: "Failed to fetch transcripts" }); }
});

app.get("/factchecks/:roomId", async (req, res) => {
  try {
    const factchecks = await FactCheck.find({ debateId: req.params.roomId }).sort({ round: 1, speaker: 1 });
    res.json(factchecks);
  } catch (err) { res.status(500).json({ error: "Failed to fetch fact-checks" }); }
});

app.get("/debate-summary/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params;
    const factchecks = await FactCheck.find({ debateId: roomId }).sort({ round: 1 });

    const roundMap = {};
    factchecks.forEach(fc => {
      if (!roundMap[fc.round]) roundMap[fc.round] = {};
      if (fc.speaker === "speaker1") roundMap[fc.round].s1 = fc.score || 0;
      if (fc.speaker === "speaker2") roundMap[fc.round].s2 = fc.score || 0;
    });

    const rounds = Object.entries(roundMap)
      .map(([round, { s1 = 0, s2 = 0 }]) => ({
        round: parseInt(round),
        speaker1Score: Math.round(s1), speaker2Score: Math.round(s2),
        roundWinner: s1 > s2 ? "speaker1" : s2 > s1 ? "speaker2" : "Draw",
      }))
      .sort((a, b) => a.round - b.round);

    const avg = (arr) => arr.length ? arr.reduce((s, f) => s + (f.score || 0), 0) / arr.length : 0;
    const s1All = factchecks.filter(f => f.speaker === "speaker1");
    const s2All = factchecks.filter(f => f.speaker === "speaker2");
    const speaker1Avg = Math.round(avg(s1All));
    const speaker2Avg = Math.round(avg(s2All));
    const winner = speaker1Avg > speaker2Avg ? "speaker1" : speaker2Avg > speaker1Avg ? "speaker2" : "Draw";

    const legacy = { speaker1: [], speaker2: [] };
    factchecks.forEach(fc => {
      const entry = { round: fc.round, score: fc.score, performance: fc.performance, verdict: fc.verdict, trueCount: fc.trueCount || 0, falseCount: fc.falseCount || 0, partialCount: fc.partialCount || 0, totalClaims: fc.totalClaims || 0 };
      if (fc.speaker === "speaker1") legacy.speaker1.push(entry);
      else legacy.speaker2.push(entry);
    });

    res.json({ speaker1Avg, speaker2Avg, winner, rounds, speaker1: legacy.speaker1, speaker2: legacy.speaker2, speaker1Overall: speaker1Avg, speaker2Overall: speaker2Avg });
  } catch (err) {
    console.error("GET /debate-summary error:", err);
    res.status(500).json({ error: "Failed to fetch summary" });
  }
});

// ─── Fact Checker ──────────────────────────────────────────────────────────
async function runFactChecker(text, userId, username, speaker, debateId, round, topic = "", stance = "", lang = "en-US") {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(`${process.env.FACT_CHECKER_URL}/analyze-debate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript: text, topic, stance, lang }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const result = await res.json();

    const verdicts = result.verdicts || [];
    const counts = { TRUE: 0, FALSE: 0, "PARTIALLY TRUE": 0 };
    verdicts.forEach(v => { const k = v.verdict?.toUpperCase(); if (counts[k] !== undefined) counts[k]++; });
    const overallVerdict = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "UNVERIFIED";

    return {
      debateId, userId, username,
      speaker,   // internal — used for DB summary queries
      round: (round !== undefined && round !== null) ? round : 0,
      claim: text, verdict: overallVerdict,
      confidence: result.score?.average_confidence || 0.5,
      score: result.score?.final_score || 50,
      performance: result.score?.performance || "Moderate",
      trueCount: result.score?.true_count || 0,
      falseCount: result.score?.false_count || 0,
      partialCount: result.score?.partially_true_count || 0,
      totalClaims: result.score?.total_claims || 0,
      reasoning: verdicts.map(v => `${v.claim}: ${v.verdict} — ${v.explanation}`).join(" | ") || "",
      fullResult: result,
    };
  } catch (err) {
    clearTimeout(timeout);
    console.error("Fact checker failed:", err.message);
    return {
      debateId, userId, username, speaker, round, claim: text,
      verdict: "UNVERIFIED", confidence: 0.5, score: 50, performance: "Moderate",
      trueCount: 0, falseCount: 0, partialCount: 0, totalClaims: 0,
      reasoning: "Fact checker unavailable",
    };
  }
}

// ─── Transcribe + Save + Emit ──────────────────────────────────────────────
async function transcribeBuffer(chunks, userId, username, speaker, round, roomId, lang = "en-US", topic = "", stance = "") {
  if (!chunks || chunks.length === 0) return;
  const combined = Buffer.concat(chunks);
  console.log(`🎙️ Transcribing userId=${userId} username=${username} speaker=${speaker} R${round} — ${combined.length} bytes`);

  try {
    const response = await deepgramTranscribe(combined, lang);
    const text = response?.results?.channels?.[0]?.alternatives?.[0]?.transcript;
    if (!text?.trim()) { console.log(`⚠️ Empty transcript: ${username} R${round}`); return; }
    console.log(`✅ [${username} R${round}]: ${text}`);

    // 1️⃣ Emit transcript — no speaker field sent to frontend
    io.to(roomId).emit("transcript", { userId, username, round, text });

    // 2️⃣ Save transcript (speaker stored internally)
    const savedTranscript = await Transcript.create({ debateId: roomId, userId, username, speaker, round, text, topic });
    console.log(`💾 Transcript saved: ${savedTranscript._id} | userId=${userId} speaker=${speaker}`);

    // 3️⃣ Fact check
    const factResult = await runFactChecker(text, userId, username, speaker, roomId, round, topic, stance, lang);

    // 4️⃣ Save fact check
    const factDoc = await FactCheck.create(factResult);
    console.log(`🔍 FactCheck saved: ${factDoc._id} | userId=${userId} speaker=${speaker}`);

    // 5️⃣ Emit fact check — strip internal fields before sending
    const { speaker: _s, fullResult: _f, ...publicFactData } = factDoc.toObject();
    io.to(roomId).emit("fact-check-result", {
      ...publicFactData,
      round: (round !== undefined && round !== null && round > 0) ? round : 1,
    });

    // 6️⃣ Attempt deep summary generation — only runs if both speakers have transcripts.
    // generateAndCacheDeepSummary checks this internally and skips if conditions aren't met.
    // It is also idempotent — skips if already cached from a complete run.
    setTimeout(() => {
      generateAndCacheDeepSummary(roomId)
        .catch(err => console.error("Background deep-summary failed:", err.message));
    }, 2500);

  } catch (err) {
    console.error("Transcription failed:", err.message, err);
  }
}

// ─── Audio buffers ─────────────────────────────────────────────────────────
// Map: socket.id → { "userId_round" → Buffer[] }
const audioBuffers = {};
// Cache username from audio:chunk so turn:end always has it even if not re-sent
const usernameCache = {}; // socket.id → username

// ─── Socket.IO ─────────────────────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log("Connected:", socket.id);
  audioBuffers[socket.id] = {};

  socket.on("create:room", () => {
    const roomId = Math.random().toString(36).substring(2, 7).toUpperCase();
    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.role = "caller";
    socket.emit("room:created", roomId);
    console.log(`Room created: ${roomId}`);
  });

  socket.on("join:room", (roomId) => {
    const room = io.sockets.adapter.rooms.get(roomId);
    if (!room) { socket.emit("room:error", "Room not found"); return; }
    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.role = "answerer";
    const others = [...room].filter(id => id !== socket.id);
    if (others.length > 0) socket.to(roomId).emit("peer:joined");
    console.log(`${socket.id} joined room: ${roomId}`);
  });

  socket.on("webrtc:offer",   (offer)   => { const r = socket.data.roomId; if (r) socket.to(r).emit("webrtc:offer", offer); });
  socket.on("webrtc:answer",  (answer)  => { const r = socket.data.roomId; if (r) socket.to(r).emit("webrtc:answer", answer); });
  socket.on("webrtc:ice",     (c)       => { const r = socket.data.roomId; if (r) socket.to(r).emit("webrtc:ice", c); });

  socket.on("debate:phase", (payload) => {
    const roomId = socket.data.roomId;
    if (!roomId) return;
    console.log(`📡 Phase: ${payload.phase} → room: ${roomId}`);
    socket.to(roomId).emit("debate:phase", payload);
  });

  // ── audio:chunk: buffer incoming audio, cache username ──────────────────
  socket.on("audio:chunk", ({ userId, username, round, chunk }) => {
    if (!userId) { console.error(`❌ audio:chunk missing userId — socket ${socket.id}`); return; }
    if (!chunk)  return;

    if (username) usernameCache[socket.id] = username;
    socket.data.userId = userId;

    const key = `${socket.id}_${round}`;

    // If turn:end already processed and deleted this key, ignore the late chunk
    if (audioBuffers[socket.id] && audioBuffers[socket.id][`${key}_done`]) {
      console.log(`⏭️ Late chunk ignored for key=${key} (turn already ended)`);
      return;
    }

    if (!audioBuffers[socket.id][key]) audioBuffers[socket.id][key] = [];
    audioBuffers[socket.id][key].push(Buffer.from(chunk));
    console.log(`📦 Chunk: userId=${userId} R${round} key=${key} — ${chunk.byteLength} bytes`);
  });

  // ── turn:end: transcribe + fact check ───────────────────────────────────
  socket.on("turn:end", async ({ userId, username, round, lang, topic, stance, roomId }) => {
    const resolvedUserId = userId || socket.data.userId || null;
    if (!resolvedUserId) {
      console.error(`❌ turn:end missing userId — socket ${socket.id}. Event dropped.`);
      return;
    }

    const resolvedUsername = (username && username !== 'Unknown')
      ? username
      : (usernameCache[socket.id] || 'Unknown');

    // Capture speaker NOW before any async work — socket.data.role must not change after this
    const speaker = socket.data.role === 'caller' ? 'speaker1' : 'speaker2';

    // Key MUST match audio:chunk — socket.id + round
    const key = `${socket.id}_${round}`;
    const chunks = audioBuffers[socket.id]?.[key];
    const debateRoomId = roomId || socket.data.roomId;

    if (!debateRoomId) { console.error("❌ Missing roomId in turn:end"); return; }

    console.log(`▶ turn:end: userId=${resolvedUserId} username=${resolvedUsername} speaker=${speaker} R${round} roomId=${debateRoomId} chunks=${chunks?.length ?? 0}`);

    await transcribeBuffer(chunks, resolvedUserId, resolvedUsername, speaker, round, debateRoomId, lang || "en-US", topic || "", stance || "");

    // Mark this key as processed — any late chunks for this round will be ignored
    if (audioBuffers[socket.id]) {
      delete audioBuffers[socket.id][key];
      audioBuffers[socket.id][`${key}_done`] = true;
    }
  });

  socket.on("speaker2:ended", () => {
    const roomId = socket.data.roomId;
    if (roomId) socket.to(roomId).emit("speaker2:ended");
  });

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
    delete audioBuffers[socket.id];
    delete usernameCache[socket.id];
  });
});

httpServer.listen(process.env.PORT || 4000, () => {
  console.log(`Server running on ${process.env.PORT || 4000}`);
});

// ─── Deep summary — generate once, serve cached ────────────────────────────

async function generateAndCacheDeepSummary(roomId) {
  // If already cached from a COMPLETE run, return it
  const existing = await DeepSummary.findOne({ debateId: roomId }).lean();
  if (existing) return existing.data;

  const transcripts = await Transcript.find({ debateId: roomId }).sort({ round: 1 });
  if (!transcripts.length) return null;

  // CRITICAL: Only generate if BOTH speakers have at least one transcript.
  // If we generate with only one speaker's text, the AI produces a one-sided
  // summary which gets cached and can never be corrected.
  const hasSpeaker1 = transcripts.some(t => t.speaker === 'speaker1');
  const hasSpeaker2 = transcripts.some(t => t.speaker === 'speaker2');
  if (!hasSpeaker1 || !hasSpeaker2) {
    console.log(`⏭️ Deep summary skipped for ${roomId} — waiting for both speakers (s1:${hasSpeaker1} s2:${hasSpeaker2})`);
    return null;
  }

  // Derive callerUserId from the speaker1 transcript — used by frontend to map You/Opponent
  const callerTranscript = transcripts.find(t => t.speaker === 'speaker1');
  const callerUserId = callerTranscript?.userId || null;

  // Use speaker1/speaker2 labels for the Python service — it was built to split on these.
  // Real usernames as labels cause the service to fail to identify two distinct sides.
  const combinedText = transcripts
    .map(t => `${t.speaker}: ${t.text}`)
    .join("\n");

  // Also send username map so the Python service can include real names in its output
  const speakerNames = {
    speaker1: transcripts.find(t => t.speaker === 'speaker1')?.username || 'Speaker 1',
    speaker2: transcripts.find(t => t.speaker === 'speaker2')?.username || 'Speaker 2',
  };

  // ── Debug logging (remove after verification) ──────────────────────────
  console.log('[DeepSummary] Speaker mapping:', speakerNames);
  console.log('[DeepSummary] Formatted text preview:\n', combinedText.slice(0, 400));
  // ───────────────────────────────────────────────────────────────────────

  const response = await fetch(`${process.env.FACT_CHECKER_URL}/deep-analysis`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: combinedText, speaker_names: speakerNames }),
  });

  const raw = await response.json();
  if (raw.error) throw new Error(raw.error);

  // Normalize: guarantee speaker1 and speaker2 always have strengths/weaknesses arrays
  const normalize = (side) => ({
    strengths:  Array.isArray(side?.strengths)  ? side.strengths  : [],
    weaknesses: Array.isArray(side?.weaknesses) ? side.weaknesses : [],
  });

  const data = {
    ...raw,
    callerUserId,
    key_points: Array.isArray(raw.key_points) ? raw.key_points : [],
    overview:   raw.overview || '',
    speaker1:   normalize(raw.speaker1),
    speaker2:   normalize(raw.speaker2),
  };

  // Only cache if both sides have at least some content
  const s1HasData = data.speaker1.strengths.length > 0 || data.speaker1.weaknesses.length > 0;
  const s2HasData = data.speaker2.strengths.length > 0 || data.speaker2.weaknesses.length > 0;
  if (!s1HasData || !s2HasData) {
    console.warn(`⚠️ Deep summary for ${roomId} has empty side(s) — NOT caching (s1:${s1HasData} s2:${s2HasData})`);
    return data; // return for immediate display but don't persist — will retry next round
  }

  await DeepSummary.create({ debateId: roomId, data });
  console.log(`✅ Deep summary cached for room: ${roomId} | callerUserId=${callerUserId}`);
  return data;
}

app.get("/deep-summary/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params;
    const data = await generateAndCacheDeepSummary(roomId);
    if (!data) return res.status(404).json({ error: "No transcripts found for this debate" });
    res.json(data);
  } catch (err) {
    console.error("deep-summary error:", err);
    res.status(500).json({ error: err.message });
  }
});