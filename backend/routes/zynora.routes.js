const router = require("express").Router();
const { chat } = require("../controllers/zynora.controller");
const {
  getConversations, createConversation, getMessages,
  renameConversation, deleteConversation, clearConversations
} = require("../controllers/conversation.controller");
const { authenticateToken } = require("../middleware/auth.middleware");

router.post("/chat", authenticateToken, chat);

router.get("/conversations", authenticateToken, getConversations);
router.post("/conversations", authenticateToken, createConversation);
router.get("/conversations/:id/messages", authenticateToken, getMessages);
router.put("/conversations/:id", authenticateToken, renameConversation);
router.delete("/conversations/:id", authenticateToken, deleteConversation);
router.delete("/conversations", authenticateToken, clearConversations);

module.exports = router;
