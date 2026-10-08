require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:1234@localhost:5432/zyngram_day11',
});

async function migrate() {
  try {
    console.log("Applying Day 13 Database modifications...");

    // Soft delete for conversations
    await pool.query(`ALTER TABLE conversations ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_conversations_user_deleted ON conversations(user_id, deleted_at)`);

    // Metrics for messages
    await pool.query(`ALTER TABLE messages ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
    await pool.query(`ALTER TABLE messages ADD COLUMN IF NOT EXISTS response_time_ms INTEGER`);
    await pool.query(`ALTER TABLE messages ADD COLUMN IF NOT EXISTS grounded BOOLEAN`);
    await pool.query(`ALTER TABLE messages ADD COLUMN IF NOT EXISTS confidence NUMERIC`);

    console.log("Database modifications successful.");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    pool.end();
  }
}

migrate();
