require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const logger = require("./config/logger");
const requestLogger = require("./middleware/requestLogger");
const zynoraRoutes = require("./routes/zynora.routes");
const adminRoutes = require("./routes/admin.routes");
const authRoutes = require("./routes/auth.routes");

const app = express();
const PORT = Number(process.env.PORT || 5000);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later."
  }
});

app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173"
}));
app.use(express.json({ limit: "1mb" }));
app.use(requestLogger);
app.use("/api", apiLimiter);

app.get("/", (req, res) => {
  res.json({ success: true, service: "Zynora", version: "2.0.0", status: "running" });
});

app.get("/api/health", (req, res) => {
  res.json({ success: true, service: "Zynora", version: "2.0.0", status: "healthy" });
});

app.use("/api/auth", authRoutes);
app.use("/api/zynora", zynoraRoutes);
app.use("/api/admin", adminRoutes);

app.use((err, req, res, next) => {
  logger.error({ traceId: req.traceId, error: err.message, stack: err.stack });
  res.status(500).json({ success: false, message: "Internal server error", traceId: req.traceId });
});

app.listen(PORT, () => {
  logger.info(`Zynora v2.0.0 backend running on port ${PORT}`);
});
