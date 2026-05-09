import './style.css';

// ─── ArguMind Dashboard Integration ───────────────────────────────────────
// Primary: identity passed via URL params from DebateRoom.jsx
// Fallback: localStorage (for direct access or page refresh)
// AFTER:
const params = new URLSearchParams(window.location.search);

const urlUserId   = params.get("userId");
const urlUsername = params.get("username");
const urlEmail    = params.get("email");

if (urlUserId) {
  window.__argumindUser = { userId: urlUserId, username: urlUsername || 'Unknown', email: urlEmail || '' };
  localStorage.setItem(`argumind_user_${urlUserId}`, JSON.stringify(window.__argumindUser));
  console.log("[ArguMind] User loaded from URL:", window.__argumindUser);
} else {
  try {
    const stored = sessionStorage.getItem('argumind_user');
    const parsed = stored ? JSON.parse(stored) : null;
    if (parsed?.userId) {
      window.__argumindUser = parsed;
      console.log("[ArguMind] User restored from sessionStorage (page refresh):", window.__argumindUser);
    } else {
      window.__argumindUser = null;
      console.error("[ArguMind] No identity found in URL or sessionStorage — open via dashboard.");
    }
  } catch (e) {
    window.__argumindUser = null;
    console.error("[ArguMind] Failed to parse identity from sessionStorage:", e);
  }
}

function getMyIdentity() {
  const u = window.__argumindUser;
  // Never return an empty userId — it causes both users to collapse into the same DB records.
  // If missing, log loudly so the developer sees it immediately.
  if (!u || !u.userId) {
    console.error('[ArguMind] getMyIdentity() called but identity is missing. Open via dashboard.');
  }
  return {
    userId:   u?.userId   || '',
    username: u?.username || 'Unknown',
    email:    u?.email    || '',
  };
}

// ─── Role + Room ───────────────────────────────────────────────────────────
let myRole = null; // 'caller' | 'answerer'
let roomId = null;
let debateContext = { topic: '', myStance: 'for' };

// ─── Restore session if socket reconnects ─────────────────────────────────
const _savedRoom = sessionStorage.getItem('argumind_room');
const _savedRole = sessionStorage.getItem('argumind_role');
if (_savedRoom && _savedRole) {
  roomId = _savedRoom;
  myRole = _savedRole;
}

//deep summary-


const modal = document.getElementById("deepSummaryModal");
const closeBtn = document.getElementById("closeDeepSummary");
const content = document.getElementById("deepSummaryContent");

// deepBtn.onclick = async () => {
//   console.log("deepBtn clicked, roomId:", roomId);
//   content.innerHTML = "Loading...";
//   modal.classList.remove("hidden");

//   const res = await fetch(`${BACKEND_URL}/deep-summary/${roomId}`);
//   const data = await res.json();
//   if (data.error) { content.innerHTML = `Error: ${data.error}`; return; }
//   renderDeepSummary(data);
// };

closeBtn.onclick = () => {
  modal.classList.add("hidden");
};

function renderDeepSummary(data) {
  const me = getMyIdentity();

  // Use callerUserId embedded in the response — does not rely on myRole being set
  // callerUserId = the userId of speaker1 (the debate caller)
  let isAnswerer;
  if (data.callerUserId && me.userId) {
    isAnswerer = me.userId !== data.callerUserId;
  } else {
    // Fallback to myRole if callerUserId unavailable (older cached summaries)
    isAnswerer = myRole === 'answerer';
    if (!data.callerUserId) console.warn('[ArguMind] renderDeepSummary: callerUserId missing from response, falling back to myRole');
  }

  const myData  = isAnswerer ? data.speaker2 : data.speaker1;
  const oppData = isAnswerer ? data.speaker1 : data.speaker2;

  if (!myData)  console.warn('[ArguMind] renderDeepSummary: myData (speaker side) is missing in response');
  if (!oppData) console.warn('[ArguMind] renderDeepSummary: oppData (opponent side) is missing in response');

  // Safety: render empty fallback instead of crashing if arrays are missing
  const safeList = (arr) => Array.isArray(arr) && arr.length
    ? arr.map(s => `<li>${s}</li>`).join("")
    : '<li><em>No data available</em></li>';

  content.innerHTML = `
    <div class="deep-section">
      <div class="deep-box">${data.overview || ''}</div>
    </div>

    <div class="deep-section">
      <div class="deep-title">KEY ARGUMENTS</div>
      <ul class="deep-list">
        ${safeList(data.key_points)}
      </ul>
    </div>

    <div class="deep-section">
      <div class="deep-title">YOU - STRENGTHS</div>
      <ul class="deep-list">
        ${safeList(myData?.strengths)}
      </ul>
    </div>

    <div class="deep-section">
      <div class="deep-title">YOU - WEAKNESSES</div>
      <ul class="deep-list">
        ${safeList(myData?.weaknesses)}
      </ul>
    </div>

    <div class="deep-section">
      <div class="deep-title">OPPONENT - STRENGTHS</div>
      <ul class="deep-list">
        ${safeList(oppData?.strengths)}
      </ul>
    </div>

    <div class="deep-section">
      <div class="deep-title">OPPONENT - WEAKNESSES</div>
      <ul class="deep-list">
        ${safeList(oppData?.weaknesses)}
      </ul>
    </div>
  `;
}





// ─── Theme toggle ──────────────────────────────────────────────────────────
const _savedTheme = localStorage.getItem('argumind_theme') || 'dark';
if (_savedTheme === 'light') document.documentElement.setAttribute('data-theme', 'light');

document.addEventListener('DOMContentLoaded', () => {
  const themeBtn = document.getElementById('themeToggle');
  if (!themeBtn) return;
  const isDark = () => document.documentElement.getAttribute('data-theme') !== 'light';
  themeBtn.textContent = isDark() ? '🌙' : '☀️';
  themeBtn.onclick = () => {
    if (isDark()) {
      document.documentElement.setAttribute('data-theme', 'light');
      themeBtn.textContent = '☀️';
      localStorage.setItem('argumind_theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
      themeBtn.textContent = '🌙';
      localStorage.setItem('argumind_theme', 'dark');
    }
  };
});

// ─── Socket connection ─────────────────────────────────────────────────────
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL === "https://api.argumind.space"
  ? "https://debate.argumind.space"
  : (import.meta.env.VITE_BACKEND_URL || "https://debate.argumind.space");
const socket = io(BACKEND_URL, {
  transports: ["websocket"],
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});

socket.on("connect_error", () => console.log("Backend waking up..."));
socket.on("reconnect", () => {
  const savedRoom = sessionStorage.getItem('argumind_room');
  const savedRole = sessionStorage.getItem('argumind_role');
  if (savedRoom && savedRole) {
    roomId = savedRoom;
    myRole = savedRole;
    if (savedRole === 'answerer') socket.emit("join:room", savedRoom);
    if (savedRole === 'caller') socket.emit("create:room");
  }
});

// ─── HTML elements ─────────────────────────────────────────────────────────
const languageSelect          = document.getElementById('languageSelect');
const debateTopicInput        = document.getElementById('debateTopic');
const roundsInput             = document.getElementById('roundsInput');
const myStanceSelect          = document.getElementById('myStance');
const setupStatus             = document.getElementById('setupStatus');
const webcamButton            = document.getElementById('webcamButton');
const webcamVideo             = document.getElementById('webcamVideo');
const callButton              = document.getElementById('callButton');
const callInput               = document.getElementById('callInput');
const answerButton            = document.getElementById('answerButton');
const remoteVideo             = document.getElementById('remoteVideo');
const hangupButton            = document.getElementById('hangupButton');
const toggleMic               = document.getElementById('toggleMic');
const toggleCamera            = document.getElementById('toggleCamera');
const durationDisplay         = document.getElementById('debateDuration');
const startDebateButton       = document.getElementById('startDebate');
const endArgumentButton       = document.getElementById('endArgument');
const debateStatus            = document.getElementById('debateStatus');
const roundDisplay            = document.getElementById('roundDisplay');
const phaseTimer              = document.getElementById('phaseTimer');
const transcriptContent  = document.getElementById('transcriptContent');
const factCheckContent   = document.getElementById('factCheckContent');

// ─── ICE servers ───────────────────────────────────────────────────────────
const servers = {
  iceServers: [
    { urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] }
  ],
  iceCandidatePoolSize: 10
};

// ─── Peer connection ───────────────────────────────────────────────────────
const pc = new RTCPeerConnection(servers);
let localStream = null;
let remoteStream = null;

// ─── WebRTC signaling via Socket.IO ───────────────────────────────────────
socket.on("room:created", (id) => {
  roomId = id;
  callInput.value = id;
  sessionStorage.setItem('argumind_room', id);
  sessionStorage.setItem('argumind_role', 'caller');
  console.log("Room created:", id);
});

socket.on("room:error", (msg) => { alert(msg); });

socket.on("peer:joined", async () => {
  console.log("peer:joined received, creating offer...");
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  socket.emit("webrtc:offer", offer);
});

socket.on("webrtc:offer", async (offer) => {
  await pc.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  socket.emit("webrtc:answer", answer);
});

socket.on("webrtc:answer", async (answer) => {
  if (!pc.currentRemoteDescription) {
    await pc.setRemoteDescription(new RTCSessionDescription(answer));
  }
});

pc.onicecandidate = (event) => {
  if (event.candidate) socket.emit("webrtc:ice", event.candidate);
};

socket.on("webrtc:ice", async (candidate) => {
  try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch (e) {}
});

// ─── Connection state ──────────────────────────────────────────────────────
pc.onconnectionstatechange = () => {
  console.log("Connection state:", pc.connectionState);
  if (pc.connectionState === 'connected') {
    startDurationTimer();
    toggleMic.disabled = false;
    toggleCamera.disabled = false;
    startDebateButton.disabled = false;
  }
  if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) {
    stopDurationTimer();
    cleanupMedia();
    webcamButton.disabled = false;
    callButton.disabled = true;
    answerButton.disabled = true;
    hangupButton.disabled = true;
    toggleMic.disabled = true;
    toggleCamera.disabled = true;
    startDebateButton.disabled = true;
    endArgumentButton.disabled = true;
  }
};

// ─── Start webcam ──────────────────────────────────────────────────────────
webcamButton.onclick = async () => {
  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  remoteStream = new MediaStream();
  localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
  pc.ontrack = (event) => {
    event.streams[0].getTracks().forEach(track => remoteStream.addTrack(track));
  };
  webcamVideo.srcObject = localStream;
  remoteVideo.srcObject = remoteStream;
  callButton.disabled = false;
  answerButton.disabled = false;
  webcamButton.disabled = true;
  toggleMic.disabled = false;
  toggleCamera.disabled = false;
};

// ─── Create call (Speaker 1) ───────────────────────────────────────────────
callButton.onclick = () => {
  myRole = 'caller';
  socket.emit("create:room");
  callButton.disabled = true;
  answerButton.disabled = true;
  hangupButton.disabled = false;
};

// ─── Answer call (Speaker 2) ───────────────────────────────────────────────
answerButton.onclick = () => {
  const id = callInput.value.trim().toUpperCase();
  if (!id) { alert("Enter a room ID first"); return; }
  myRole = 'answerer';
  roomId = id;
  sessionStorage.setItem('argumind_room', id);
  sessionStorage.setItem('argumind_role', 'answerer');
  socket.emit("join:room", id);
  callButton.disabled = true;
  answerButton.disabled = true;
  hangupButton.disabled = false;
};

// ─── Hangup ────────────────────────────────────────────────────────────────
hangupButton.onclick = () => {
  stopTurnRecording(myRole, debateState.round);
  cleanupMedia();
  pc.close();
  callInput.value = '';
  sessionStorage.removeItem('argumind_room');
  sessionStorage.removeItem('argumind_role');
  localStorage.removeItem('argumind_user');
  debateContext = { topic: '', myStance: 'for' };
  if (debateTopicInput) { debateTopicInput.value = ''; debateTopicInput.disabled = false; }
  if (roundsInput)      { roundsInput.value = '5'; roundsInput.disabled = false; }
  if (myStanceSelect)   { myStanceSelect.disabled = false; }
  if (setupStatus)      { setupStatus.textContent = ''; }
  webcamButton.disabled = false;
  callButton.disabled = true;
  answerButton.disabled = true;
  hangupButton.disabled = true;
};

// ─── Cleanup ───────────────────────────────────────────────────────────────
function cleanupMedia() {
  if (localStream) { localStream.getTracks().forEach(t => t.stop()); localStream = null; }
  if (remoteStream) { remoteStream.getTracks().forEach(t => t.stop()); remoteStream = null; }
  webcamVideo.srcObject = null;
  remoteVideo.srcObject = null;
}

// ─── Mic / Camera toggles ──────────────────────────────────────────────────
toggleMic.onclick = () => {
  if (!localStream) return;
  const t = localStream.getAudioTracks()[0];
  t.enabled = !t.enabled;
  toggleMic.textContent = t.enabled ? '🎙️ Mute' : '🔇 Unmute';
};

let dummyVideoTrack = null;

toggleCamera.onclick = async () => {
  if (!localStream) return;
  const existingTrack = localStream.getVideoTracks()[0];
  if (existingTrack && existingTrack.readyState === 'live') {
    // Create black dummy track so remote sees blank screen (not a frozen frame)
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    canvas.getContext('2d').fillRect(0, 0, canvas.width, canvas.height);
    dummyVideoTrack = canvas.captureStream().getVideoTracks()[0];

    // Replace sender with dummy BEFORE stopping tracks
    const sender = pc.getSenders().find(s => s.track?.kind === 'video');
    if (sender) await sender.replaceTrack(dummyVideoTrack);

    // Stop only the video track — leave audio untouched
    existingTrack.stop();
    webcamVideo.srcObject = null;
    toggleCamera.textContent = '📷 Show Camera';
  } else {
    try {
      // Stop dummy track before replacing with real track
      dummyVideoTrack?.stop();
      dummyVideoTrack = null;

      const newStream = await navigator.mediaDevices.getUserMedia({ video: true });
      const newVideoTrack = newStream.getVideoTracks()[0];
      const sender = pc.getSenders().find(s => s.track?.kind === 'video');
      if (sender) await sender.replaceTrack(newVideoTrack);
      // Remove the stale ended track before adding the new one
      localStream.getVideoTracks().forEach(t => localStream.removeTrack(t));
      localStream.addTrack(newVideoTrack);
      webcamVideo.srcObject = null;
      webcamVideo.srcObject = localStream;
      toggleCamera.textContent = '📷 Hide Camera';
    } catch (e) {
      console.error('Camera restart failed:', e);
    }
  }
};

// ─── Duration timer ────────────────────────────────────────────────────────
let durationInterval = null;
let durationSeconds = 0;

function startDurationTimer() {
  durationSeconds = 0;
  durationInterval = setInterval(() => {
    durationSeconds++;
    const m = String(Math.floor(durationSeconds / 60)).padStart(2, '0');
    const s = String(durationSeconds % 60).padStart(2, '0');
    durationDisplay.textContent = `Duration: ${m}:${s}`;
  }, 1000);
}

function stopDurationTimer() {
  clearInterval(durationInterval);
  durationSeconds = 0;
  durationDisplay.textContent = 'Duration: 00:00';
}

// ─── Transcript display ────────────────────────────────────────────────────
socket.on("transcript", ({ userId, username, round, text }) => {
  const me = getMyIdentity();
  console.log("[Identity Debug]", { me: me.userId, incoming: userId });
  const isMe = me.userId && userId && userId === me.userId;
  const label = isMe ? 'You' : (username || 'Opponent');

  if (transcriptContent.classList.contains('placeholder-active')) {
    transcriptContent.innerHTML = '';
    transcriptContent.classList.remove('placeholder-active');
  }

  const entry = document.createElement('div');
  entry.className = `chat-bubble ${isMe ? 'chat-bubble--me' : 'chat-bubble--them'}`;
  entry.innerHTML = `
    <span class="chat-label">${label} · R${round}</span>
    <div class="chat-text">${text}</div>
  `;

  transcriptContent.appendChild(entry);
  transcriptContent.scrollTop = transcriptContent.scrollHeight;
});

// ─── Fact check display ────────────────────────────────────────────────────
socket.on("fact-check-result", (data) => {
  const me = getMyIdentity();
  console.log("[Identity Debug]", { me: me.userId, incoming: data.userId });
  const isMe = me.userId && data.userId && data.userId === me.userId;
  const label = isMe ? 'You' : (data.username || 'Opponent');

  const verdict = data.verdict?.toUpperCase() || 'UNVERIFIED';
  const score = data.score || 50;

  const parsed = parseInt(data.round, 10);
  const round = (!isNaN(parsed) && parsed > 0) ? parsed : '?';

  const performance = data.performance || '';
  const reasoning = typeof data.reasoning === 'string' ? data.reasoning : 'Result unavailable';

  const verdictColor = {
    'TRUE': '#27ae60',
    'FALSE': '#e74c3c',
    'PARTIALLY TRUE': '#f39c12',
    'UNVERIFIED': '#95a5a6',
  }[verdict] || '#95a5a6';

  const claimBreakdown = (data.totalClaims > 0)
    ? `<div class="factcheck-claims-breakdown">
        <span class="claim-tag true">✅ ${data.trueCount}</span>
        <span class="claim-tag partial">⚠️ ${data.partialCount}</span>
        <span class="claim-tag false">❌ ${data.falseCount}</span>
        <span class="claim-tag total">of ${data.totalClaims} claims</span>
       </div>`
    : '';

  const entry = document.createElement('div');
  entry.className = `factcheck-entry ${isMe ? 'factcheck-mine' : 'factcheck-opponent'}`;
  entry.style.textAlign = isMe ? 'right' : 'left';

  entry.innerHTML = `
    <div class="factcheck-round-label">${label} — Round ${round}</div>
    <div class="factcheck-verdict" style="color:${verdictColor}">
      ${getVerdictIcon(verdict)} ${verdict}
      ${performance ? `<span class="performance-badge" style="background:${verdictColor}22;color:${verdictColor}">${performance}</span>` : ''}
    </div>
    <div class="score-bar-wrap">
      <div class="score-bar" style="width:${Math.min(score,100)}%;background:${verdictColor}"></div>
    </div>
    <span class="score-num">${Math.round(score)}/100</span>
    ${claimBreakdown}
    <div class="factcheck-reasoning">${reasoning}</div>
  `;

  if (factCheckContent.classList.contains('placeholder-active')) {
    factCheckContent.innerHTML = '';
    factCheckContent.classList.remove('placeholder-active');
  }

  factCheckContent.appendChild(entry);
  factCheckContent.scrollTop = factCheckContent.scrollHeight;
});

function getVerdictIcon(verdict) {
  switch (verdict?.toUpperCase()) {
    case 'TRUE': return '✅';
    case 'FALSE': return '❌';
    case 'PARTIALLY TRUE': return '⚠️';
    default: return '❓';
  }
}

// ─── Beep on turn start ────────────────────────────────────────────────────
function playTurnBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {}
}

// ═══════════════════════════════════════════════════════════════════════════
// DEBATE LOGIC
// ═══════════════════════════════════════════════════════════════════════════

let TOTAL_ROUNDS   = 5;  // overridden at debate start from #roundsInput
const SPEAK_TIME     = 30;
const FREE_TALK_TIME = 20;
const DELAY_TIME     = 10;
const BREAK_TIME     = 10;

let debateState = {
  active: false,
  round: 0,
  phase: 'idle',
  timer: null,
  secondsLeft: 0,
};

let debateSummaryData = {};

let turnRecorder = null;

// ─── Mic control ───────────────────────────────────────────────────────────
function setMic(enabled) {
  if (!localStream) return;
  localStream.getAudioTracks().forEach(t => t.enabled = enabled);
}

// ─── UI helpers ────────────────────────────────────────────────────────────
function updateStatus(text) { debateStatus.textContent = text; }

function updatePhaseTimer(seconds) {
  if (seconds <= 0) { phaseTimer.textContent = ''; return; }
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  phaseTimer.textContent = `${m}:${s}`;
}

function clearDebateTimer() {
  if (debateState.timer) clearInterval(debateState.timer);
}

function startCountdown(seconds, onTick, onDone) {
  clearDebateTimer();
  debateState.secondsLeft = seconds;
  onTick(seconds);
  debateState.timer = setInterval(() => {
    debateState.secondsLeft--;
    onTick(debateState.secondsLeft);
    if (debateState.secondsLeft <= 0) {
      clearDebateTimer();
      onDone();
    }
  }, 1000);
}

// ─── applyPhase ────────────────────────────────────────────────────────────
function applyPhase(phase, round) {
  debateState.phase = phase;
  debateState.round = round;

  if (round > 0) roundDisplay.textContent = `Round ${round} / ${TOTAL_ROUNDS}`;
  endArgumentButton.disabled = true;

  switch (phase) {
    case 'freetalk':
      setMic(true);
      updateStatus('🗣️ Free talk — both can speak');
      break;
    case 'speaker1':
      setMic(myRole === 'caller');
      updateStatus('🎙️ Speaker 1 is arguing...');
      if (myRole === 'caller') { endArgumentButton.disabled = false; playTurnBeep(); }
      break;
    case 'delay':
      setMic(true);
      updateStatus('⏳ Delay — both can speak freely');
      break;
    case 'speaker2':
      setMic(myRole === 'answerer');
      updateStatus('🎙️ Speaker 2 is arguing...');
      if (myRole === 'answerer') { endArgumentButton.disabled = false; playTurnBeep(); }
      break;
    case 'break':
      setMic(false);
      updateStatus(`⏸️ End of Round ${round} — short break`);
      roundDisplay.textContent = `Round ${round} / ${TOTAL_ROUNDS} — Break`;
      break;
    case 'over':
      setMic(true);
      updateStatus('🏁 Debate Over');
      roundDisplay.textContent = '';
      phaseTimer.textContent = '';
      startDebateButton.disabled = true;
      break;
  }
}

// ─── Answerer mirrors phase from caller ────────────────────────────────────
socket.on("debate:phase", ({ phase, round, secondsLeft, topic, callerStance, totalRounds }) => {
  console.log("debate:phase received", phase, round, "myRole:", myRole);
  if (myRole !== 'answerer') return;

  if (totalRounds) TOTAL_ROUNDS = totalRounds;

  // Sync topic + derive answerer's stance (opposite of caller's)
  if (topic && !debateContext.topic) {
    debateContext.topic = topic;
    debateContext.myStance = callerStance === 'for' ? 'against' : 'for';
    if (debateTopicInput) { debateTopicInput.value = topic; debateTopicInput.disabled = true; }
    if (roundsInput)      { roundsInput.value = totalRounds; roundsInput.disabled = true; }
    if (myStanceSelect)   { myStanceSelect.value = debateContext.myStance; myStanceSelect.disabled = true; }
    if (setupStatus) setupStatus.textContent = `Topic locked — You are arguing ${debateContext.myStance.toUpperCase()}`;
  }

  const prevPhase = debateState.phase;
  const prevRound = debateState.round;
  applyPhase(phase, round);

  if (phase === 'speaker2' && prevPhase !== 'speaker2') {
    startTurnRecording('speaker2', round);
  }
  if (prevPhase === 'speaker2' && phase !== 'speaker2') {
    if (turnRecorder && turnRecorder.state !== 'inactive') {
      stopTurnRecording('speaker2', debateState.currentRecordingRound ?? prevRound);
    }
  }

  if (secondsLeft > 0) startCountdown(secondsLeft, updatePhaseTimer, () => {});
  if (phase === 'over') setTimeout(() => fetchAndShowSummary(roomId), 5000);
});

// ─── Speaker 2 ended early ─────────────────────────────────────────────────
socket.on("speaker2:ended", () => {
  if (myRole !== 'caller') return;
  clearDebateTimer();

  // Ensure consistent flow
  startRoundBreak(debateState.round);
});

// ─── Broadcast phase to answerer ──────────────────────────────────────────
function broadcastPhase(phase, round, secondsLeft = 0) {
  if (myRole !== 'caller') return;
  const lang = languageSelect.value;
  socket.emit('debate:phase', {
    phase, round, secondsLeft, lang,
    topic: debateContext.topic,
    callerStance: debateContext.myStance,
    totalRounds: TOTAL_ROUNDS,
  });
}

// ─── Turn recorder ─────────────────────────────────────────────────────────
function startTurnRecording(speaker, round) {
  if (!localStream) return;
  debateState.currentRecordingRound = round;

  // Snapshot round at recording start — all chunks for this turn must use this value
  const snapshotRound = round;

  const audioStream = new MediaStream(localStream.getAudioTracks());

  // Stable MIME type for Deepgram
  const mimeType = 'audio/webm;codecs=opus';

  turnRecorder = new MediaRecorder(audioStream, { mimeType });

  turnRecorder.ondataavailable = (event) => {
    // Ignore tiny / corrupt chunks
    if (event.data && event.data.size > 1000) {

      event.data.arrayBuffer().then(buf => {

        // Convert to Uint8Array to preserve binary integrity
        const bytes = new Uint8Array(buf);

        const me = getMyIdentity();
        socket.emit('audio:chunk', {
        userId: me.userId,
        round: snapshotRound,
        chunk: bytes
        });

      });

    }
  };

  // Slightly larger chunk size improves Deepgram reliability
  turnRecorder.start(4000);

  console.log(`🔴 Recording: ${speaker} R${round}`);
}

function stopTurnRecording(speaker, round) {
  if (!turnRecorder || turnRecorder.state === 'inactive') return;

  // Capture round NOW before any async nullification
  const recordingRound = debateState.currentRecordingRound ?? round;
  debateState.currentRecordingRound = null;

  const recorderRef = turnRecorder;
  turnRecorder = null;

  recorderRef.onstop = () => {
    const me = getMyIdentity();
    socket.emit('turn:end', {
      userId:   me.userId,
      username: me.username,
      round: recordingRound,
      lang: languageSelect.value,
      topic: debateContext.topic,
      stance: debateContext.myStance,
      roomId,
    });
    console.log(`⏹️ turn:end emitted: ${me.username} R${recordingRound}`);
  };

  recorderRef.stop();
  console.log(`⏹️ Stopped recorder: ${speaker} R${recordingRound}`);
}

// ─── Debate flow ──────────────────────────────────────────────────────────
function startFreeTalk() {
  applyPhase('freetalk', 0);
  broadcastPhase('freetalk', 0, FREE_TALK_TIME);
  startCountdown(FREE_TALK_TIME, updatePhaseTimer, () => startRound(1));
}

function startRound(round) {
  if (round > TOTAL_ROUNDS) { endDebate(); return; }
  debateState.round = round;
  startSpeaker1Turn();
}

function startSpeaker1Turn() {
  applyPhase('speaker1', debateState.round);
  broadcastPhase('speaker1', debateState.round, SPEAK_TIME);
  startTurnRecording('speaker1', debateState.round);
  startCountdown(SPEAK_TIME, updatePhaseTimer, () => {
    stopTurnRecording('speaker1', debateState.round);
    startDelay();
  });
}

function startDelay() {
  applyPhase('delay', debateState.round);
  broadcastPhase('delay', debateState.round, DELAY_TIME);
  startCountdown(DELAY_TIME, updatePhaseTimer, startSpeaker2Turn);
}

function startSpeaker2Turn() {
  applyPhase('speaker2', debateState.round);
  broadcastPhase('speaker2', debateState.round, SPEAK_TIME);
  startCountdown(SPEAK_TIME, updatePhaseTimer, () => startRoundBreak(debateState.round));
}

function startRoundBreak(round) {
  applyPhase('break', round);
  broadcastPhase('break', round, BREAK_TIME);
  startCountdown(BREAK_TIME, updatePhaseTimer, () => startRound(round + 1));
}

function endDebate() {
  clearDebateTimer();
  debateState.active = false;
  applyPhase('over', debateState.round);
  broadcastPhase('over', debateState.round);
  setTimeout(() => fetchAndShowSummary(roomId), 5000);
}

async function fetchAndShowSummary(debateRoomId) {
  if (!debateRoomId) return;
  try {
    const res = await fetch(`${BACKEND_URL}/debate-summary/${debateRoomId}`);
    const data = await res.json();
    if (data.error) return;
    renderSummary(data);
  } catch (err) {
    console.error("Summary fetch failed:", err.message);
  }
}

function renderSummary(data) {
  const summaryEl = document.getElementById('overallSummary');
  const placeholder = document.getElementById('summaryPlaceholder');
  if (!summaryEl) return;

  const me = getMyIdentity();
  const isAnswerer = myRole === 'answerer';
  const myWinnerKey = isAnswerer ? 'speaker2' : 'speaker1';

  const winnerLabel = data.winner === 'Draw'
    ? '🤝 Draw'
    : data.winner === myWinnerKey
      ? `🏆 You win! (${me.username})`
      : '🏆 Opponent wins';

  const winnerColor = data.winner === 'speaker1' ? '#22D3EE'
    : data.winner === 'speaker2' ? '#A855F7'
    : '#f39c12';

  const renderRounds = (rounds) => {
  if (!rounds || rounds.length === 0) {
    return `<div class="summary-empty">No valid rounds</div>`;
  }

  return rounds.map((r, index) => {
    const roundNum = (r.round !== undefined && r.round !== null) ? r.round : (index + 1);

    const color = {
      'TRUE': '#27ae60',
      'FALSE': '#e74c3c',
      'PARTIALLY TRUE': '#f39c12',
      'UNVERIFIED': '#95a5a6'
    }[r.verdict?.toUpperCase()] || '#95a5a6';

    return `
      <div class="summary-round-row">
        <span class="summary-round-label">
          R${roundNum}
        </span>
        <div class="score-bar-wrap" style="width:80px">
          <div class="score-bar" style="width:${Math.min(r.score || 0,100)}%;background:${color}"></div>
        </div>
        <span class="score-num">${Math.round(r.score || 0)}/100</span>
        <span class="performance-badge" style="background:${color}22;color:${color}">
          ${r.performance || '—'}
        </span>
      </div>
    `;
  }).join('');
};

  const myLabel = `You (${me.username})`;
  const opponentLabel = 'Opponent';

  const myData     = isAnswerer ? data.speaker2 : data.speaker1;
  const oppData    = isAnswerer ? data.speaker1 : data.speaker2;
  const myOverall  = isAnswerer ? data.speaker2Overall : data.speaker1Overall;
  const oppOverall = isAnswerer ? data.speaker1Overall : data.speaker2Overall;

  summaryEl.innerHTML = `
    
  <div style="text-align:center;margin-bottom:10px;">
    <button id="deepSummaryBtn" class="btn btn-accent">
      ✨ Deep Summary
    </button>
  </div>

  <div class="summary-winner" style="color:${winnerColor}">
    ${winnerLabel}
  </div>

  <div class="summary-columns">


    
      <div class="summary-col">
        <div class="summary-col-header">${myLabel} <span class="summary-overall">${myOverall}/100</span></div>
        ${renderRounds(myData)}
      </div>
      <div class="summary-col">
        <div class="summary-col-header">${opponentLabel} <span class="summary-overall">${oppOverall}/100</span></div>
        ${renderRounds(oppData)}
      </div>
    </div>
  `;

  if (placeholder) placeholder.style.display = 'none';
  summaryEl.style.display = 'block';

  const deepSummaryBtn = document.getElementById("deepSummaryBtn");
  if (deepSummaryBtn) {
    deepSummaryBtn.onclick = async () => {
      // roomId may be null for answerer — fall back to sessionStorage
      const activeRoomId = roomId || sessionStorage.getItem('argumind_room');
      console.log("[DeepSummary] Button clicked, roomId:", activeRoomId);

      const modalEl   = document.getElementById("deepSummaryModal");
      const contentEl = document.getElementById("deepSummaryContent");

      contentEl.innerHTML = "Loading...";
      modalEl.classList.remove("hidden");

      if (!activeRoomId) {
        contentEl.innerHTML = "Error: Room ID not found. Please rejoin the debate.";
        return;
      }

      try {
        const res = await fetch(`${BACKEND_URL}/deep-summary/${activeRoomId}`);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text);
        }
        const result = await res.json();
        if (result.error) {
          contentEl.innerHTML = `Error: ${result.error}`;
          return;
        }
        renderDeepSummary(result);
      } catch (e) {
        contentEl.innerHTML = `Error: ${e.message}`;
      }
    };
  }
}

// ─── Button handlers ───────────────────────────────────────────────────────
startDebateButton.onclick = () => {
  if (!localStream) { alert('Start your webcam first!'); return; }
  if (myRole !== 'caller') { alert('Only Speaker 1 can start the debate!'); return; }
  const topic = debateTopicInput.value.trim();
  if (!topic) { alert('Please enter the debate topic first!'); return; }
  const roundsVal = parseInt(roundsInput?.value, 10);
  TOTAL_ROUNDS = (!isNaN(roundsVal) && roundsVal >= 1 && roundsVal <= 10) ? roundsVal : 5;
  if (roundsInput) roundsInput.disabled = true;
  debateContext.topic = topic;
  debateContext.myStance = myStanceSelect.value;
  debateTopicInput.disabled = true;
  myStanceSelect.disabled = true;
  setupStatus.textContent = `Topic locked — You are arguing ${debateContext.myStance.toUpperCase()}`;
  debateState.active = true;
  startDebateButton.disabled = true;
  startFreeTalk();
};

endArgumentButton.onclick = () => {
  if (debateState.phase === 'speaker1' && myRole === 'caller') {
    clearDebateTimer();
    stopTurnRecording('speaker1', debateState.round);
    startDelay();
  }
  if (debateState.phase === 'speaker2' && myRole === 'answerer') {
    clearDebateTimer();
    stopTurnRecording('speaker2', debateState.round);
    // Notify caller to advance the debate flow — do NOT call startRoundBreak here
    // (the caller drives all phase transitions; answerer only mirrors them)
    socket.emit('speaker2:ended');
    // Apply break phase locally so UI reflects the change
    applyPhase('break', debateState.round);
    updatePhaseTimer(0);
  }
};