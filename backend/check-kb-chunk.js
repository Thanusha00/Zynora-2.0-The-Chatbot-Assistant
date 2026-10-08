require("dotenv").config();

const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function check() {
  try {
    const result = await pool.query(
      `SELECT id, document_id, content, status
       FROM knowledge_chunks
       WHERE document_id = $1`,
      ["KB001"]
    );

    console.log(JSON.stringify(result.rows, null, 2));
  } catch (error) {
    console.error("ERROR:", error.message);
  } finally {
    await pool.end();
  }
}

check();
