const pool = require("../config/database");
const ragService = require("../services/rag.service");

const {
  isPromptInjection,
  sanitizeMessage
} = require("../middleware/security");

const SECURITY_BLOCK_MESSAGE =
  "I couldn't find this information in the approved Zyngram knowledge base.";

async function chat(req, res) {
  const startTime = Date.now();

  try {
    /*
     * 1. Read and sanitize the incoming question.
     */
    const rawQuestion = req.body?.question || "";
    const question = sanitizeMessage(rawQuestion);

    const conversationId =
      req.body?.conversationId || null;

    /*
     * 2. Validate question.
     */
    if (!question) {
      return res.status(400).json({
        success: false,
        message: "Question is required"
      });
    }

    if (question.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Question is too long"
      });
    }

    /*
     * 3. Detect prompt injection BEFORE RAG retrieval.
     */
    const promptInjectionDetected =
      isPromptInjection(question);

    /*
     * 4. Load conversation history only when
     * continuing an existing conversation.
     */
    let conversationHistory = [];

    if (conversationId) {
      const ownership = await pool.query(
        `SELECT id
         FROM conversations
         WHERE id = $1
           AND user_id = $2
           AND deleted_at IS NULL`,
        [
          conversationId,
          req.user.id
        ]
      );

      if (!ownership.rows.length) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized conversation"
        });
      }

      const historyResult = await pool.query(
        `SELECT role, content
         FROM messages
         WHERE conversation_id = $1
         ORDER BY id ASC
         LIMIT 20`,
        [conversationId]
      );

      conversationHistory =
        historyResult.rows;
    }

    /*
     * 5. Create a conversation if this is a new chat.
     */
    let activeConversationId =
      conversationId;

    if (!activeConversationId) {
      const conversationResult =
        await pool.query(
          `INSERT INTO conversations
            (user_id, title)
           VALUES
            ($1, $2)
           RETURNING
            id,
            title,
            created_at,
            updated_at`,
          [
            req.user.id,
            question.slice(0, 80)
          ]
        );

      activeConversationId =
        conversationResult.rows[0].id;
    }

    /*
     * 6. Save the sanitized user message.
     */
    await pool.query(
      `INSERT INTO messages
        (
          conversation_id,
          role,
          content
        )
       VALUES
        ($1, $2, $3)`,
      [
        activeConversationId,
        "user",
        question
      ]
    );

    /*
     * 7. Security block.
     *
     * Prompt injection is blocked before RAG retrieval.
     */
    if (promptInjectionDetected) {
      const responseTimeMs =
        Date.now() - startTime;

      const securityResult = {
        answer: SECURITY_BLOCK_MESSAGE,
        sources: [],
        retrievedChunks: [],
        relevanceScore: 0,
        grounded: false,
        confidence: 0
      };

      /*
       * Make security result available to requestLogger.
       */
      req.zynoraResult = {
        ...securityResult,
        conversationId: activeConversationId,
        securityBlocked: true
      };

      await pool.query(
        `INSERT INTO messages
          (
            conversation_id,
            role,
            content,
            retrieved_chunks,
            relevance_score,
            response_time_ms,
            grounded,
            confidence
          )
         VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          activeConversationId,
          "ai",
          SECURITY_BLOCK_MESSAGE,
          JSON.stringify([]),
          0,
          responseTimeMs,
          false,
          0
        ]
      );

      await pool.query(
        `UPDATE conversations
         SET updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [activeConversationId]
      );

      return res.json({
        success: true,
        conversationId:
          activeConversationId,
        answer:
          SECURITY_BLOCK_MESSAGE,
        sources: [],
        retrievedChunks: [],
        relevanceScore: 0,
        grounded: false,
        confidence: 0,
        responseTimeMs,
        securityBlocked: true
      });
    }

    /*
     * 8. Run the approved RAG pipeline.
     */
    const result =
      await ragService.processQuestion(
        question,
        conversationHistory
      );

    const responseTimeMs =
      Date.now() - startTime;

    /*
     * 9. Expose RAG result to requestLogger.
     *
     * This allows monitoring to record:
     * - conversation
     * - retrieval status
     * - source
     * - grounded status
     * - response time
     */
    req.zynoraResult = {
      ...result,
      conversationId: activeConversationId,
      responseTimeMs,
      securityBlocked: false
    };

    /*
     * 10. Save AI response.
     */
    await pool.query(
      `INSERT INTO messages
        (
          conversation_id,
          role,
          content,
          retrieved_chunks,
          relevance_score,
          response_time_ms,
          grounded,
          confidence
        )
       VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        activeConversationId,
        "ai",
        result.answer,
        JSON.stringify(
          result.retrievedChunks || []
        ),
        result.relevanceScore || 0,
        responseTimeMs,
        result.grounded || false,
        result.confidence || 0
      ]
    );

    /*
     * 11. Update conversation timestamp.
     */
    await pool.query(
      `UPDATE conversations
       SET updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [activeConversationId]
    );

    /*
     * 12. Return production response.
     */
    return res.json({
      success: true,
      conversationId:
        activeConversationId,
      answer: result.answer,
      sources:
        result.sources || [],
      retrievedChunks:
        result.retrievedChunks || [],
      relevanceScore:
        result.relevanceScore || 0,
      grounded:
        result.grounded || false,
      confidence:
        result.confidence || 0,
      responseTimeMs,
      securityBlocked: false
    });

  } catch (error) {
    console.error(
      "Zynora chat error:",
      error
    );

    /*
     * Make error information available to monitoring
     * when the request logger runs.
     */
    req.zynoraResult = {
      answer: null,
      sources: [],
      retrievedChunks: [],
      relevanceScore: 0,
      grounded: false,
      confidence: 0,
      securityBlocked: false,
      error: true
    };

    return res.status(500).json({
      success: false,
      message:
        "Failed to process your question"
    });
  }
}

module.exports = {
  chat
};