const pool = require("../config/database");

/**
 * Get all normal users
 * Admin only
 */
async function getUsers(req, res) {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        email,
        role,
        status,
        created_at
      FROM users
      WHERE UPPER(role) <> 'ADMIN'
      ORDER BY created_at DESC
    `);

    console.log("Admin users:", result.rows);

    res.json({
      success: true,
      users: result.rows,
    });
  } catch (error) {
    console.error("Get users error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}


/**
 * Get individual user dashboard
 * Admin only
 */
async function getUserDashboard(req, res) {
  try {
    const { id } = req.params;

    // --------------------------------------------------
    // USER INFORMATION
    // --------------------------------------------------
    const userResult = await pool.query(
      `
      SELECT
        id,
        name,
        email,
        role,
        status,
        created_at
      FROM users
      WHERE id = $1
        AND UPPER(role) <> 'ADMIN'
      `,
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = userResult.rows[0];


    // --------------------------------------------------
    // TOTAL CONVERSATIONS
    // --------------------------------------------------
    const conversationResult = await pool.query(
      `
      SELECT COUNT(*)::int AS count
      FROM conversations
      WHERE user_id = $1
      `,
      [id]
    );


    // --------------------------------------------------
    // TOTAL QUESTIONS
    // Messages don't have user_id.
    // They belong to conversations.
    // --------------------------------------------------
    const questionResult = await pool.query(
      `
      SELECT COUNT(*)::int AS count
      FROM messages m
      INNER JOIN conversations c
        ON c.id = m.conversation_id
      WHERE c.user_id = $1
        AND LOWER(m.role) = 'user'
      `,
      [id]
    );


    // --------------------------------------------------
    // TOTAL AI ANSWERS
    // --------------------------------------------------
    const answerResult = await pool.query(
      `
      SELECT COUNT(*)::int AS count
      FROM messages m
      INNER JOIN conversations c
        ON c.id = m.conversation_id
      WHERE c.user_id = $1
        AND LOWER(m.role) = 'ai'
      `,
      [id]
    );


    // --------------------------------------------------
    // RECENT CONVERSATIONS
    // --------------------------------------------------
    const conversationsResult = await pool.query(
      `
      SELECT
        id,
        title,
        created_at,
        updated_at
      FROM conversations
      WHERE user_id = $1
      ORDER BY
        updated_at DESC NULLS LAST,
        created_at DESC
      LIMIT 20
      `,
      [id]
    );


    // --------------------------------------------------
    // CHAT HISTORY
    // --------------------------------------------------
    const messagesResult = await pool.query(
      `
      SELECT
        m.id,
        m.conversation_id,
        c.title AS conversation_title,
        m.role,
        m.content,
        m.retrieved_chunks,
        m.relevance_score
      FROM messages m
      INNER JOIN conversations c
        ON c.id = m.conversation_id
      WHERE c.user_id = $1
      ORDER BY
        c.updated_at DESC,
        m.id ASC
      LIMIT 100
      `,
      [id]
    );


    // --------------------------------------------------
    // DAILY USER ACTIVITY
    // --------------------------------------------------
    const activityResult = await pool.query(
      `
      SELECT
        DATE(c.updated_at) AS date,
        COUNT(*)::int AS questions
      FROM messages m
      INNER JOIN conversations c
        ON c.id = m.conversation_id
      WHERE c.user_id = $1
        AND LOWER(m.role) = 'user'
      GROUP BY DATE(c.updated_at)
      ORDER BY DATE(c.updated_at) DESC
      LIMIT 14
      `,
      [id]
    );


    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------
    res.json({
      success: true,

      user,

      statistics: {
        conversations:
          conversationResult.rows[0]?.count || 0,

        questions:
          questionResult.rows[0]?.count || 0,

        answers:
          answerResult.rows[0]?.count || 0,
      },

      conversations:
        conversationsResult.rows,

      messages:
        messagesResult.rows,

      activity:
        activityResult.rows,
    });

  } catch (error) {
    console.error(
      "User dashboard error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}


/**
 * Get knowledge documents
 */
async function getDocuments(req, res) {
  try {
    const result = await pool.query(`
      SELECT *
      FROM knowledge_documents
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      documents: result.rows,
    });

  } catch (error) {
    console.error(
      "Get documents error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load documents",
    });
  }
}


/**
 * Create knowledge document
 */
async function createDocument(req, res) {
  try {
    const {
      title,
      category,
      content,
      source,
      version,
      status,
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required",
      });
    }

    const id =
      "KB" +
      Date.now().toString().slice(-8);

    const result = await pool.query(
      `
      INSERT INTO knowledge_documents
      (
        id,
        title,
        category,
        content,
        source,
        version,
        status
      )
      VALUES
      ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *
      `,
      [
        id,
        title,
        category || "FAQ",
        content,
        source || "admin",
        version || "1.0",
        status || "DRAFT",
      ]
    );

    res.status(201).json({
      success: true,
      document: result.rows[0],
    });

  } catch (error) {
    console.error(
      "Create document error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to create document",
    });
  }
}


/**
 * Update knowledge document
 */
async function updateDocument(req, res) {
  try {
    const { id } = req.params;

    const {
      title,
      category,
      content,
      source,
      version,
      status,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE knowledge_documents
      SET
        title = COALESCE($1, title),
        category = COALESCE($2, category),
        content = COALESCE($3, content),
        source = COALESCE($4, source),
        version = COALESCE($5, version),
        status = COALESCE($6, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
      `,
      [
        title,
        category,
        content,
        source,
        version,
        status,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    res.json({
      success: true,
      document: result.rows[0],
    });

  } catch (error) {
    console.error(
      "Update document error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update document",
    });
  }
}


/**
 * Delete knowledge document
 */
async function deleteDocument(req, res) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM knowledge_documents
      WHERE id = $1
      RETURNING id
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    res.json({
      success: true,
      message: "Document deleted",
    });

  } catch (error) {
    console.error(
      "Delete document error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to delete document",
    });
  }
}


/**
 * Monitoring metrics
 */
async function getMetrics(req, res) {
  try {
    const conversations = await pool.query(`
      SELECT COUNT(*)::int AS count
      FROM conversations
    `);

    const questions = await pool.query(`
      SELECT COUNT(*)::int AS count
      FROM messages
      WHERE LOWER(role) = 'user'
    `);

    const answers = await pool.query(`
      SELECT COUNT(*)::int AS count
      FROM messages
      WHERE LOWER(role) = 'ai'
    `);

    const users = await pool.query(`
      SELECT COUNT(*)::int AS count
      FROM users
      WHERE UPPER(role) <> 'ADMIN'
    `);

    res.json({
      success: true,

      metrics: {
        totalUsers:
          users.rows[0]?.count || 0,

        totalConversations:
          conversations.rows[0]?.count || 0,

        totalQuestions:
          questions.rows[0]?.count || 0,

        successfulAnswers:
          answers.rows[0]?.count || 0,

        noAnswerResponses: 0,

        averageResponseTimeMs: 0,

        errorCount: 0,
      },
    });

  } catch (error) {
    console.error(
      "Metrics error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load metrics",
    });
  }
}


/**
 * System logs
 */
async function getLogs(req, res) {
  try {
    const result = await pool.query(`
      SELECT *
      FROM system_logs
      ORDER BY created_at DESC
      LIMIT 100
    `);

    res.json({
      success: true,
      logs: result.rows,
    });

  } catch (error) {
    console.error(
      "Logs error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load logs",
    });
  }
}


module.exports = {
  getUsers,
  getUserDashboard,

  getDocuments,
  createDocument,
  updateDocument,
  deleteDocument,

  getMetrics,
  getLogs,
};