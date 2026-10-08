require("dotenv").config();

const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function check() {
  try {
    const result = await pool.query(
      `SELECT id, title, content, status, version
       FROM knowledge_documents
       WHERE id = $1`,
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
