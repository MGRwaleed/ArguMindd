import "dotenv/config";
import { transcribeFile } from "./src/services/transcriptionService.js";


async function runTest() {
  try {
    const result = await transcribeFile(
      "./samples/speaker_a.mp3",  // change filename if needed
      {
        speakerId: "speakerA",
        debateId: "debate_001",
        filename: "speaker_a.mp3",
      }
    );

    console.log("\n===== FULL TRANSCRIPT =====\n");
    console.log(result.fullText);

    console.log("\n===== PARAGRAPHS =====\n");
    result.paragraphs?.forEach((p) => {
      console.log(`[${p.start?.toFixed(1)}s → ${p.end?.toFixed(1)}s] ${p.text}`);
    });

    console.log("\n===== STATS =====\n");
    console.log(result.stats);

    if (result.qualityWarnings?.length > 0) {
      console.log("\n⚠ QUALITY WARNINGS:");
      result.qualityWarnings.forEach((w) => console.log(" -", w));
    }

    console.log("\n✅ TEST SUCCESSFUL");

  } catch (error) {
    console.error("\n❌ TEST FAILED");
    console.error(error.message);
  }
}

runTest();
