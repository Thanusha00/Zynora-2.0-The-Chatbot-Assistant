require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function syncKB001() {
  const filePath = path.join(
    __dirname,
    "..",
    "knowledge-base",
    "company",
    "overview.txt"
  );

  const content = fs.readFileSync(filePath, "utf8").trim();

  if (!content) {
    throw new Error("Approved KB file is empty.");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      `UPDATE knowledge_documents
       SET content = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [content, "KB001"]
    );

    await client.query(
      `UPDATE knowledge_chunks
       SET content = $1
       WHERE document_id = $2`,
      [content, "KB001"]
    );

    await client.query("COMMIT");

    console.log("KB001 synchronization successful.");
    console.log("Source:", filePath);
    console.log("Content:", content);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

syncKB001()
  .catch((error) => {
    console.error("KB synchronization failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
