const { v4: uuidv4 } = require("uuid");
const pool = require("../config/database");
const logger = require("../config/logger");

function requestLogger(req, res, next) {
  const traceId = req.headers["x-trace-id"] || uuidv4();

  req.traceId = traceId;
  res.setHeader("X-Trace-ID", traceId);

  const started = Date.now();

  res.on("finish", async () => {
    const responseTimeMs = Date.now() - started;
    const status = res.statusCode >= 400 ? "Error" : "Success";

    logger.info({
      traceId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: responseTimeMs,
      userId: req.user?.id || null
    });

    if (req.originalUrl.startsWith("/api/")) {
      try {
        const body = req.body || {};

        /*
         * Question submitted by the user.
         */
        const question =
          typeof body.question === "string"
            ? body.question.slice(0, 2000)
            : null;

        /*
         * Prefer the actual conversation ID produced by
         * the Zynora controller.
         *
         * Fall back to the conversationId supplied in
         * the request body when necessary.
         */
        const conversationId =
          req.zynoraResult?.conversationId ||
          (typeof body.conversationId === "string"
            ? body.conversationId
            : null);

        /*
         * RAG monitoring information.
         */
        let retrievalStatus = null;
        let source = null;

        if (req.zynoraResult) {
          retrievalStatus =
            req.zynoraResult.grounded === true
              ? "SUCCESS"
              : "NO_MATCH";

          if (req.zynoraResult.sources) {
            source = JSON.stringify(
              req.zynoraResult.sources
            );
          }
        }

        /*
         * HTTP error monitoring.
         */
        const error =
          res.statusCode >= 400 ||
          status === "Error";

        /*
         * Persist monitoring information.
         */
        await pool.query(
          `INSERT INTO system_logs
           (
             trace_id,
             user_id,
             action,
             module,
             status,
             error_details,
             response_time_ms,
             conversation_id,
             question,
             retrieval_status,
             source,
             error
           )
           VALUES
           ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
          [
            traceId,
            req.user?.id || null,
            `${req.method} ${req.path}`,
            "HTTP",
            status,
            status === "Error"
              ? `HTTP ${res.statusCode}`
              : null,
            responseTimeMs,
            conversationId,
            question,
            retrievalStatus,
            source,
            error
          ]
        );
      } catch (e) {
        logger.error({
          message: "Could not persist request log",
          error: e.message
        });
      }
    }
  });

  next();
}

module.exports = requestLogger;