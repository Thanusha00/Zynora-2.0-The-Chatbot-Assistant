const bcrypt = require("bcryptjs");
const pool = require("./config/database");

async function seed() {
  try {
    // =========================
    // 1. CREATE ADMIN USER
    // =========================

    const password = await bcrypt.hash("Admin@123", 10);

    await pool.query(
      `INSERT INTO users(name, email, password_hash, role)
       VALUES($1, $2, $3, 'ADMIN')
       ON CONFLICT(email) DO NOTHING`,
      [
        "Zynora Admin",
        "admin@zyngram.com",
        password
      ]
    );

    console.log("Admin user checked.");

    // =========================
    // 2. ZYNGRAM KNOWLEDGE
    // =========================

    const documents = [
      {
        id: "KB001",
        title: "Zyngram Overview",
        category: "Company",
        content:
          "Zyngram is the approved company knowledge platform for its internal ecosystem, services and franchise operations.",
        source: "company/overview.txt",
        version: "1.0",
        status: "APPROVED"
      },

      {
        id: "KB002",
        title: "Physical Franchise Hierarchy",
        category: "Franchise",
        content:
          "The physical franchise hierarchy is Point → Center → Hub → Command → HQ.",
        source: "franchise/physical-hierarchy.txt",
        version: "1.0",
        status: "APPROVED"
      },

      {
        id: "KB003",
        title: "Digital Franchise Hierarchy",
        category: "Franchise",
        content:
          "The digital franchise hierarchy is Node → Zone → Territory → Region → Nation.",
        source: "franchise/digital-hierarchy.txt",
        version: "1.0",
        status: "APPROVED"
      }
    ];

    // =========================
    // 3. INSERT DOCUMENTS
    // =========================

    for (const document of documents) {

      const existing = await pool.query(
        `SELECT id
         FROM knowledge_documents
         WHERE id = $1`,
        [document.id]
      );

      if (existing.rows.length > 0) {
        console.log(
          `Document ${document.id} already exists. Skipping.`
        );
        continue;
      }

      await pool.query(
        `INSERT INTO knowledge_documents
         (id, title, category, content, source, version, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          document.id,
          document.title,
          document.category,
          document.content,
          document.source,
          document.version,
          document.status
        ]
      );

      // =========================
      // 4. INSERT KNOWLEDGE CHUNK
      // =========================

      await pool.query(
        `INSERT INTO knowledge_chunks
         (
           document_id,
           title,
           category,
           section,
           version,
           source,
           status,
           content
         )
         VALUES
         (
           $1,
           $2,
           $3,
           $4,
           $5,
           $6,
           $7,
           $8
         )`,
        [
          document.id,
          document.title,
          document.category,
          "Main",
          document.version,
          document.source,
          document.status,
          document.content
        ]
      );

      console.log(
        `Inserted ${document.id} - ${document.title}`
      );
    }

    console.log("");
    console.log("====================================");
    console.log("Zynora seed completed successfully.");
    console.log("====================================");
    console.log("");
    console.log("Admin Login:");
    console.log("Email: admin@zyngram.com");
    console.log("Password: Admin@123");
    console.log("");
  } catch (error) {
    console.error("Seed error:", error);
  } finally {
    await pool.end();
  }
}

seed();