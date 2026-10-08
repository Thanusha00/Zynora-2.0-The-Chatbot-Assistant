const pool = require("./config/database");

(async () => {
  try {
    const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema='public'
      ORDER BY table_name
    `);
    console.table(result.rows);
  } catch (e) {
    console.error(e);
  } finally {
    await pool.end();
  }
})();
