import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { parseBloodRequestText } from "../modules/ai/ai.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface SampleExpected {
  bloodGroup?: string | null;
  district?: string | null;
  urgency?: "NORMAL" | "URGENT" | "CRITICAL" | null;
  [key: string]: any;
}

interface Sample {
  text: string;
  expected: SampleExpected;
}

interface Failure {
  index: number;
  text: string;
  field: string;
  expected: any;
  actual: any;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function runEvaluation() {
  console.log("🚀 Starting BloodSync AI Extraction Evaluation...\n");

  const samplesPath = path.resolve(__dirname, "../tests/ai-eval/samples.json");
  const rawData = await fs.readFile(samplesPath, "utf-8");
  const samples: Sample[] = JSON.parse(rawData);

  console.log(`Loaded ${samples.length} test samples from ${samplesPath}\n`);

  const fieldStats = {
    bloodGroup: { total: 0, correct: 0 },
    district: { total: 0, correct: 0 },
    urgency: { total: 0, correct: 0 },
  };

  const responseTimes: number[] = [];
  const failures: Failure[] = [];
  let fullyCorrectSamples = 0;

  for (let i = 0; i < samples.length; i++) {
    const sample = samples[i];
    console.log(`[${i + 1}/${samples.length}] Processing: "${sample.text.slice(0, 50)}..."`);

    let result: any = null;
    let duration = 0;

    // Run with 1 retry on 429 or temporary provider error
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const start = Date.now();
        result = await parseBloodRequestText(sample.text);
        duration = Date.now() - start;
        responseTimes.push(duration);
        break;
      } catch (err: any) {
        console.warn(`  ⚠️ Attempt ${attempt} failed: ${err.message}`);
        if (attempt === 1) {
          console.log("  ⏳ Waiting 4 seconds before retry...");
          await sleep(4000);
        } else {
          result = null;
        }
      }
    }

    if (!result) {
      console.error(`  ❌ Failed to get response for sample ${i + 1}`);
      for (const field of ["bloodGroup", "district", "urgency"] as const) {
        if (field in sample.expected) {
          fieldStats[field].total++;
          failures.push({
            index: i + 1,
            text: sample.text,
            field,
            expected: sample.expected[field],
            actual: "ERROR_NO_RESPONSE",
          });
        }
      }
      continue;
    }

    let sampleFailed = false;

    // Check each expected field
    for (const field of ["bloodGroup", "district", "urgency"] as const) {
      if (field in sample.expected) {
        fieldStats[field].total++;
        const expectedVal = sample.expected[field];
        const actualVal = result.fields[field];

        if (actualVal === expectedVal) {
          fieldStats[field].correct++;
        } else {
          sampleFailed = true;
          failures.push({
            index: i + 1,
            text: sample.text,
            field,
            expected: expectedVal,
            actual: actualVal,
          });
          console.log(`    ❌ Mismatch on [${field}]: expected "${expectedVal}", got "${actualVal}"`);
        }
      }
    }

    if (!sampleFailed) {
      fullyCorrectSamples++;
      console.log(`  ✅ All expected fields matched (${duration}ms)`);
    }

    // Wait 3 seconds between samples to respect free tier rate limits
    if (i < samples.length - 1) {
      await sleep(3000);
    }
  }

  // Calculations
  const avgResponseTime =
    responseTimes.length > 0
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
      : 0;

  const bgAcc =
    fieldStats.bloodGroup.total > 0
      ? ((fieldStats.bloodGroup.correct / fieldStats.bloodGroup.total) * 100).toFixed(1)
      : "N/A";
  const distAcc =
    fieldStats.district.total > 0
      ? ((fieldStats.district.correct / fieldStats.district.total) * 100).toFixed(1)
      : "N/A";
  const urgAcc =
    fieldStats.urgency.total > 0
      ? ((fieldStats.urgency.correct / fieldStats.urgency.total) * 100).toFixed(1)
      : "N/A";

  const totalCheckedFields =
    fieldStats.bloodGroup.total + fieldStats.district.total + fieldStats.urgency.total;
  const totalCorrectFields =
    fieldStats.bloodGroup.correct + fieldStats.district.correct + fieldStats.urgency.correct;
  const overallFieldAccuracy =
    totalCheckedFields > 0 ? ((totalCorrectFields / totalCheckedFields) * 100).toFixed(1) : "0.0";
  const sampleAccuracy = ((fullyCorrectSamples / samples.length) * 100).toFixed(1);

  // Print Summary to Console
  console.log("\n==================================================");
  console.log("            AI EVALUATION SUMMARY                 ");
  console.log("==================================================");
  console.log(`Total Samples:           ${samples.length}`);
  console.log(`Perfect Samples:         ${fullyCorrectSamples}/${samples.length} (${sampleAccuracy}%)`);
  console.log(`Overall Field Accuracy:  ${totalCorrectFields}/${totalCheckedFields} (${overallFieldAccuracy}%)`);
  console.log(`Average Response Time:   ${avgResponseTime} ms`);
  console.log("--------------------------------------------------");
  console.log(`Blood Group Accuracy:    ${fieldStats.bloodGroup.correct}/${fieldStats.bloodGroup.total} (${bgAcc}%)`);
  console.log(`District Accuracy:       ${fieldStats.district.correct}/${fieldStats.district.total} (${distAcc}%)`);
  console.log(`Urgency Accuracy:        ${fieldStats.urgency.correct}/${fieldStats.urgency.total} (${urgAcc}%)`);
  console.log("==================================================");

  if (failures.length > 0) {
    console.log(`\nFailed Field Cases (${failures.length}):`);
    failures.forEach((f) => {
      console.log(`  - Sample #${f.index} [${f.field}]: expected "${f.expected}", got "${f.actual}"`);
      console.log(`    Text: "${f.text}"`);
    });
  } else {
    console.log("\n🎉 Outstanding! All benchmark cases passed with 100% accuracy!");
  }

  // Generate Markdown Report
  const docsDir = path.resolve(__dirname, "../../docs");
  await fs.mkdir(docsDir, { recursive: true });

  const markdownContent = `# AI Extraction Evaluation Report

*Generated on: ${new Date().toISOString()}*

## 1. Summary Metrics

| Metric | Value |
| :--- | :--- |
| **Total Test Samples** | ${samples.length} |
| **Fully Correct Samples** | ${fullyCorrectSamples} / ${samples.length} (${sampleAccuracy}%) |
| **Overall Field Accuracy** | ${totalCorrectFields} / ${totalCheckedFields} (${overallFieldAccuracy}%) |
| **Average Response Time** | ${avgResponseTime} ms |

---

## 2. Per-Field Accuracy

| Field | Tested Cases | Correct Matches | Accuracy |
| :--- | :--- | :--- | :--- |
| **bloodGroup** | ${fieldStats.bloodGroup.total} | ${fieldStats.bloodGroup.correct} | **${bgAcc}%** |
| **district** | ${fieldStats.district.total} | ${fieldStats.district.correct} | **${distAcc}%** |
| **urgency** | ${fieldStats.urgency.total} | ${fieldStats.urgency.correct} | **${urgAcc}%** |

---

## 3. Failed Cases Analysis

${
  failures.length === 0
    ? "✅ **All evaluation samples passed with 100% precision!**"
    : `| Sample # | Input Text | Field | Expected | Actual |
| :---: | :--- | :---: | :---: | :---: |
${failures
  .map(
    (f) =>
      `| ${f.index} | ${f.text.replace(/\|/g, "\\|")} | **${f.field}** | \`${f.expected}\` | \`${f.actual}\` |`
  )
  .join("\n")}`
}

---

## 4. Evaluation Methodology
- Model tested via OpenRouter.
- Free-tier compliant with 3-second delay between inference requests.
- Only specified benchmark ground-truth fields were scored.
`;

  const reportPath = path.join(docsDir, "ai-evaluation.md");
  await fs.writeFile(reportPath, markdownContent, "utf-8");
  console.log(`\n📄 Report successfully saved to: ${reportPath}\n`);
}

runEvaluation().catch((err) => {
  console.error("Evaluation script encountered fatal error:", err);
  process.exit(1);
});
