const API_BASE = "https://zynora-2-0-the-chatbot-assistant.onrender.com/api";


async function request(url, options = {}) {
  const token =
    localStorage.getItem("zynora_token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization =
      `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE}${url}`,
    {
      ...options,
      headers,
    }
  );

  let data;

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(
      data.message ||
      "Request failed"
    );
  }

  return data;
}


export const api = {

  /*
  |--------------------------------------------------------------------------
  | Authentication
  |--------------------------------------------------------------------------
  */

  login: (email, password) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
    }),

  register: (
    email,
    password,
    name
  ) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        name,
      }),
    }),


  /*
  |--------------------------------------------------------------------------
  | Chat
  |--------------------------------------------------------------------------
  */

  chat: (
  message,
  conversationId = null
) =>
  request("/zynora/chat", {
    method: "POST",
    body: JSON.stringify({
      question: message,
      conversationId,
    }),
  }),


  /*
  |--------------------------------------------------------------------------
  | Conversations
  |--------------------------------------------------------------------------
  */

  getConversations: () =>
    request(
      "/zynora/conversations"
    ),

  createConversation: (
    title = "New Conversation"
  ) =>
    request(
      "/zynora/conversations",
      {
        method: "POST",
        body: JSON.stringify({
          title,
        }),
      }
    ),

  getConversationMessages: (
    conversationId
  ) =>
    request(
      `/zynora/conversations/${conversationId}/messages`
    ),

  renameConversation: (
    conversationId,
    title
  ) =>
    request(
      `/zynora/conversations/${conversationId}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          title,
        }),
      }
    ),

  deleteConversation: (
    conversationId
  ) =>
    request(
      `/zynora/conversations/${conversationId}`,
      {
        method: "DELETE",
      }
    ),

  clearConversation: (
    conversationId
  ) =>
    request(
      `/zynora/conversations/${conversationId}/clear`,
      {
        method: "POST",
      }
    ),


  /*
  |--------------------------------------------------------------------------
  | Admin Knowledge
  |--------------------------------------------------------------------------
  */

  getAdminDocuments: () =>
    request("/admin/documents"),

  createKnowledgeDocument: (
    document
  ) =>
    request("/admin/documents", {
      method: "POST",
      body: JSON.stringify(document),
    }),

  updateKnowledgeDocument: (
    id,
    document
  ) =>
    request(
      `/admin/documents/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(document),
      }
    ),

  deleteKnowledgeDocument: (
    id
  ) =>
    request(
      `/admin/documents/${id}`,
      {
        method: "DELETE",
      }
    ),


  /*
  |--------------------------------------------------------------------------
  | Admin Monitoring
  |--------------------------------------------------------------------------
  */

  getMonitoringMetrics: () =>
    request("/admin/metrics"),

  getSystemLogs: () =>
    request("/admin/logs"),


  /*
  |--------------------------------------------------------------------------
  | NEW: User Management
  |--------------------------------------------------------------------------
  */

  getUsers: () =>
    request("/admin/users"),


  getUserDashboard: (
    userId
  ) =>
    request(
      `/admin/users/${userId}/dashboard`
    ),
};