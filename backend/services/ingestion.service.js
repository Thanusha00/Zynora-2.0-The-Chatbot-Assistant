const fs = require("fs");
const path = require("path");
const pool = require("../config/database");

function cleanText(text) {
  return String(text || "")
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function parseFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const raw = fs.readFileSync(filePath, "utf8");

  if (ext === ".json") {
    const data = JSON.parse(raw);
    return typeof data.content === "string" ? data.content : JSON.stringify(data, null, 2);
  }

  if (ext === ".md" || ext === ".txt") return raw;

  throw new Error("Only TXT, Markdown and JSON are supported");
}

function chunkText(text, maxChars = 900) {
  const paragraphs = cleanText(text).split(/\n\s*\n/);
  const chunks = [];
  let current = "";

  for (const paragraph of paragraphs) {
    if (!paragraph) continue;

    if ((current + "\n\n" + paragraph).length > maxChars && current) {
      chunks.push(current.trim());
      current = paragraph;
    } else {
      current = current ? `${current}\n\n${paragraph}` : paragraph;
    }
  }

  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

async function ingestDocument({ title, category, source, version, status, filePath }) {
  const text = cleanText(parseFile(filePath));
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const doc = await client.query(
      `INSERT INTO knowledge_documents
       (title, category, content, source, version, status)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id`,
      [title, category, text, source, version, status || "DRAFT"]
    );

    const documentId = doc.rows[0].id;
    const chunks = chunkText(text);

    for (let i = 0; i < chunks.length; i++) {
      await client.query(
        `INSERT INTO knowledge_chunks
         (document_id, chunk_index, title, category, section, version, source, status, content)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          documentId, i, title, category, `Chunk ${i + 1}`,
          version, source, status || "DRAFT", chunks[i]
        ]
      );
    }

    await client.query("COMMIT");
    return { documentId, chunkCount: chunks.length };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { cleanText, chunkText, ingestDocument };
