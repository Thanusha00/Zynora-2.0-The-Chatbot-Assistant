const pool = require("../config/database");

async function getConversations(req, res) {
  try {
    const result = await pool.query(
      `SELECT
         id,
         title,
         created_at,
         updated_at
       FROM conversations
       WHERE user_id = $1
       ORDER BY updated_at DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      conversations: result.rows
    });
  } catch (error) {
    console.error("Get conversations error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load conversations"
    });
  }
}


async function createConversation(req, res) {
  try {
    const title = String(
      req.body?.title || "New Conversation"
    )
      .trim()
      .slice(0, 255);

    const result = await pool.query(
      `INSERT INTO conversations
        (user_id, title)
       VALUES
        ($1, $2)
       RETURNING *`,
      [
        req.user.id,
        title || "New Conversation"
      ]
    );

    res.status(201).json({
      success: true,
      conversation: result.rows[0]
    });
  } catch (error) {
    console.error("Create conversation error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create conversation"
    });
  }
}


async function getMessages(req, res) {
  try {
    // Make sure the conversation belongs to the logged-in user
    const ownership = await pool.query(
      `SELECT
         id,
         title
       FROM conversations
       WHERE id = $1
         AND user_id = $2`,
      [
        req.params.id,
        req.user.id
      ]
    );

    if (!ownership.rows.length) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized or conversation not found"
      });
    }

    const result = await pool.query(
      `SELECT
         id,
         role,
         content,
         retrieved_chunks,
         relevance_score
       FROM messages
       WHERE conversation_id = $1
       ORDER BY id ASC`,
      [req.params.id]
    );

    res.json({
      success: true,
      conversation: ownership.rows[0],
      messages: result.rows
    });

  } catch (error) {
    console.error("Get messages error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load messages"
    });
  }
}


async function renameConversation(req, res) {
  try {
    const title = String(
      req.body?.title || ""
    )
      .trim()
      .slice(0, 255);

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required"
      });
    }

    const result = await pool.query(
      `UPDATE conversations
       SET
         title = $1,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
         AND user_id = $3
       RETURNING *`,
      [
        title,
        req.params.id,
        req.user.id
      ]
    );

    if (!result.rows.length) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized or conversation not found"
      });
    }

    res.json({
      success: true,
      conversation: result.rows[0]
    });

  } catch (error) {
    console.error("Rename conversation error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to rename conversation"
    });
  }
}


async function deleteConversation(req, res) {
  try {
    const result = await pool.query(
      `DELETE FROM conversations
       WHERE id = $1
         AND user_id = $2
       RETURNING id`,
      [
        req.params.id,
        req.user.id
      ]
    );

    if (!result.rows.length) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized or conversation not found"
      });
    }

    res.json({
      success: true,
      message: "Conversation deleted"
    });

  } catch (error) {
    console.error("Delete conversation error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete conversation"
    });
  }
}


async function clearConversations(req, res) {
  try {
    await pool.query(
      `DELETE FROM conversations
       WHERE user_id = $1`,
      [req.user.id]
    );

    res.json({
      success: true,
      message: "All conversations cleared"
    });

  } catch (error) {
    console.error("Clear conversations error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to clear conversations"
    });
  }
}


module.exports = {
  getConversations,
  createConversation,
  getMessages,
  renameConversation,
  deleteConversation,
  clearConversations
};