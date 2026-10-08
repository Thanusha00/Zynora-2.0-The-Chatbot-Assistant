const fs = require("fs");
const path = require("path");

const file = path.join(
  __dirname,
  "results",
  "test-results.json"
);

const results = JSON.parse(
  fs.readFileSync(file, "utf8")
);

const failures = results.filter(
  (r) => r.status === "Fail"
);

console.log(`Total failures: ${failures.length}`);
console.log("");

for (const r of failures) {
  console.log("==========================================");
  console.log(`ID: ${r.id}`);
  console.log(`Category: ${r.category}`);
  console.log(`Question: ${r.question}`);
  console.log(`Expected: ${r.expected}`);
  console.log(`Actual: ${r.actual}`);
  console.log(`Relevance Score: ${r.relevanceScore}`);
  console.log(`Grounded: ${r.grounded}`);
  console.log(`Confidence: ${r.confidence}`);
  console.log(`Response Time: ${r.responseTimeMs} ms`);
  console.log(`Classification: ${r.classification}`);
  console.log(`Reason: ${r.reason}`);
  console.log("Sources:");
  console.log(JSON.stringify(r.source, null, 2));
  console.log("Retrieved Chunks:");
  console.log(JSON.stringify(r.retrievedChunks, null, 2));
  console.log("");
}