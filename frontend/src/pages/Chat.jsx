
import React, { useEffect, useState } from "react";
import { api } from "../api";

export default function Chat({ user, onAdmin, onLogout }) {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Suggested follow-up questions
  // Confirm these topics exist in the approved knowledge base.
  const suggestedQuestions = [
    "What is Zyngram?",
    "How does franchise registration work?",
    "What services does Zyngram provide?",
  ];

  // Load all conversations
  async function loadConversations() {
    try {
      const data = await api.getConversations();
      const list = data.conversations || [];

      setConversations(list);

      if (!activeId && list.length > 0) {
        await selectConversation(list[0].id);
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
    }
  }

  // Select a conversation
  async function selectConversation(id) {
    try {
      setActiveId(id);
      setMessages([]);

      const data = await api.getConversationMessages(id);
      setMessages(data.messages || []);
    } catch (error) {
      console.error("Failed to load conversation:", error);
      setMessages([]);
    }
  }

  // Create a new conversation
  async function newConversation() {
    try {
      const data = await api.createConversation("New Conversation");

      if (data.conversation) {
        setConversations((prev) => [
          data.conversation,
          ...prev,
        ]);

        setActiveId(data.conversation.id);
        setMessages([]);
        setInput("");
      }
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
  }

  // Send a message or a suggested question to Zynora
  async function sendMessage(question = input) {
    if (!question.trim() || !activeId || loading) {
      return;
    }

    const text = question.trim();

    setInput("");

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: text,
      },
    ]);

    setLoading(true);

    try {
      const data = await api.chat(text, activeId);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content:
            data.answer ||
            "I couldn't find this information in the approved Zyngram knowledge base.",
          sources: data.sources || [],
          grounded: data.grounded,
          confidence: data.confidence,
          response_time_ms: data.responseTimeMs,
        },
      ]);

      await loadConversations();
    } catch (error) {
      console.error("Chat error:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content:
            "Unable to get a response right now. Please try again.",
          grounded: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  // Delete current conversation
  async function deleteConversation() {
    if (!activeId) {
      return;
    }

    try {
      await api.deleteConversation(activeId);

      setActiveId(null);
      setMessages([]);
      setInput("");

      await loadConversations();
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  }

  // Load conversations when page opens
  useEffect(() => {
    loadConversations();
  }, []);

  // Show suggested questions only after an AI response
  const showSuggestions =
    !loading &&
    messages.length > 0 &&
    messages[messages.length - 1].role === "ai";

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          Zynora <span>2.0</span>
        </div>

        <button onClick={newConversation}>
          + New Conversation
        </button>

        <div className="conversation-list">
          {conversations.length === 0 && (
            <div className="empty">
              No conversations yet.
            </div>
          )}

          {conversations.map((conversation) => (
            <button
              className={
                activeId === conversation.id
                  ? "conversation active"
                  : "conversation"
              }
              key={conversation.id}
              onClick={() =>
                selectConversation(conversation.id)
              }
            >
              {conversation.title || "New Conversation"}
            </button>
          ))}
        </div>

        <div className="sidebar-bottom">
          {user?.role === "ADMIN" && (
            <button onClick={onAdmin}>
              Admin Dashboard
            </button>
          )}

          <button onClick={onLogout}>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="chat-main">
        <header>
          <div>
            <strong>Zynora</strong>
            <small>Approved Zyngram knowledge only</small>
          </div>

          <button
            onClick={deleteConversation}
            disabled={!activeId || loading}
          >
            Delete
          </button>
        </header>

        {/* Messages */}
        <section className="messages">
          {!activeId && (
            <div className="empty">
              Create a conversation to start.
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`bubble ${
                message.role === "user" ? "user" : "bot"
              }`}
            >
              <strong>
                {message.role === "user" ? "You" : "Zynora"}
              </strong>

              <div className="content">
                {message.content}
              </div>

              {/* Approved knowledge sources */}
              {message.role === "ai" &&
                message.grounded &&
                message.sources?.length > 0 && (
                  <div className="source-card">
                    <div>
                      Grounded • Confidence{" "}
                      {message.confidence ?? 0}%
                    </div>

                    {message.sources.map((source, sourceIndex) => (
                      <div key={sourceIndex}>
                        {source.title}
                        {source.version
                          ? ` · v${source.version}`
                          : ""}
                        {source.category
                          ? ` · ${source.category}`
                          : ""}
                      </div>
                    ))}
                  </div>
                )}

              {/* No approved source */}
              {message.role === "ai" &&
                message.grounded === false && (
                  <div className="no-source">
                    No approved knowledge source found.
                  </div>
                )}
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="bubble bot">
              <strong>Zynora</strong>
              <div className="content">
                Zynora is retrieving approved knowledge...
              </div>
            </div>
          )}

          {/* NEW FEATURE: Suggested follow-up questions */}
          {showSuggestions && activeId && (
            <div className="suggested-questions">
              <p>Suggested questions</p>

              {suggestedQuestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => sendMessage(question)}
                  disabled={loading}
                >
                  {question}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Message Input */}
        <footer>
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Ask a Zyngram question..."
            disabled={!activeId || loading}
          />

          <button
            onClick={() => sendMessage()}
            disabled={!activeId || loading || !input.trim()}
          >
            Send
          </button>
        </footer>
      </main>
    </div>
  );
}
