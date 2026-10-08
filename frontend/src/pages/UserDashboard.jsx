import React, {
  useEffect,
  useState,
} from "react";

import { api } from "../api";


export default function UserDashboard({
  user,
  onBack,
  onLogout,
}) {

  const [
    dashboard,
    setDashboard,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");


  async function loadDashboard() {

    try {

      setLoading(true);
      setError("");

      const data =
        await api.getUserDashboard(
          user.id
        );

      setDashboard(data);

    } catch (err) {

      console.error(
        "User dashboard error:",
        err
      );

      setError(
        err.message ||
        "Failed to load user dashboard"
      );

    } finally {

      setLoading(false);

    }
  }


  useEffect(() => {

    if (user?.id) {
      loadDashboard();
    }

  }, [user?.id]);


  if (loading) {

    return (
      <div className="admin-page">

        <div className="dashboard-loading">

          <div className="loading-spinner">
            ◌
          </div>

          <h2>
            Loading user dashboard...
          </h2>

          <p>
            Retrieving user activity.
          </p>

        </div>

      </div>
    );
  }


  if (error) {

    return (
      <div className="admin-page">

        <header className="admin-header">

          <div>
            <div className="admin-kicker">
              USER ANALYTICS
            </div>

            <h1>
              User Dashboard
            </h1>
          </div>

          <button
            className="secondary-button"
            onClick={onBack}
          >
            ← Back to Users
          </button>

        </header>


        <div className="error-message">
          {error}
        </div>

      </div>
    );
  }


  const stats =
    dashboard?.statistics || {};

  const selectedUser =
    dashboard?.user || user;

  const conversations =
    dashboard?.conversations || [];

  const messages =
    dashboard?.messages || [];

  const activity =
    dashboard?.activity || [];


  return (
    <div className="admin-page">

      {/* HEADER */}

      <header className="admin-header">

        <div>

          <div className="admin-kicker">
            USER ANALYTICS
          </div>

          <h1>
            {selectedUser.name ||
              "User Dashboard"}
          </h1>

          <p>
            Individual Zynora activity
            and usage analytics.
          </p>

        </div>


        <div className="admin-header-actions">

          <button
            className="secondary-button"
            onClick={onBack}
          >
            ← Back to Users
          </button>

          <button
            className="danger-button"
            onClick={onLogout}
          >
            Logout
          </button>

        </div>

      </header>


      <main className="user-dashboard-container">


        {/* USER PROFILE */}

        <section className="user-profile-card">

          <div className="large-user-avatar">

            {(
              selectedUser.name ||
              selectedUser.email ||
              "U"
            )
              .charAt(0)
              .toUpperCase()}

          </div>


          <div className="profile-info">

            <h2>
              {selectedUser.name ||
                "Unnamed User"}
            </h2>

            <p>
              {selectedUser.email}
            </p>

            <div className="profile-meta">

              <span>
                Role:{" "}
                <strong>
                  {selectedUser.role ||
                    "USER"}
                </strong>
              </span>

              <span>
                Joined:{" "}
                <strong>
                  {selectedUser.created_at
                    ? new Date(
                        selectedUser.created_at
                      ).toLocaleDateString(
                        "en-IN"
                      )
                    : "-"}
                </strong>
              </span>

            </div>

          </div>


          <div className="profile-status">

            <span className="status-dot"></span>

            Active User

          </div>

        </section>


        {/* STATISTICS */}

        <section className="user-stat-grid">

          <StatCard
            icon="💬"
            title="Conversations"
            value={
              stats.conversations || 0
            }
          />

          <StatCard
            icon="❓"
            title="Questions Asked"
            value={
              stats.questions || 0
            }
          />

          <StatCard
            icon="🤖"
            title="AI Answers"
            value={
              stats.answers || 0
            }
          />

          <StatCard
            icon="📊"
            title="Activity Days"
            value={
              activity.length
            }
          />

        </section>


        {/* CONTENT GRID */}

        <section className="user-dashboard-grid">


          {/* CONVERSATIONS */}

          <div className="panel">

            <div className="panel-heading">

              <div>
                <h2>
                  Conversations
                </h2>

                <p>
                  Recent conversations
                  created by this user.
                </p>
              </div>

            </div>


            {conversations.length ===
            0 ? (

              <div className="dashboard-empty">
                No conversations found.
              </div>

            ) : (

              <div className="dashboard-list">

                {conversations.map(
                  (conversation) => (

                    <div
                      className="conversation-item"
                      key={conversation.id}
                    >

                      <div className="conversation-icon">
                        💬
                      </div>

                      <div className="conversation-info">

                        <strong>
                          {conversation.title ||
                            "New Conversation"}
                        </strong>

                        <small>
                          {conversation.updated_at
                            ? new Date(
                                conversation.updated_at
                              ).toLocaleString(
                                "en-IN"
                              )
                            : conversation.created_at
                            ? new Date(
                                conversation.created_at
                              ).toLocaleString(
                                "en-IN"
                              )
                            : "-"}
                        </small>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </div>


          {/* ACTIVITY */}

          <div className="panel">

            <div className="panel-heading">

              <div>
                <h2>
                  Activity
                </h2>

                <p>
                  Questions asked over time.
                </p>
              </div>

            </div>


            {activity.length ===
            0 ? (

              <div className="dashboard-empty">
                No activity recorded.
              </div>

            ) : (

              <div className="activity-list">

                {activity.map(
                  (item, index) => (

                    <div
                      className="activity-row"
                      key={index}
                    >

                      <span>
                        {new Date(
                          item.date
                        ).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                          }
                        )}
                      </span>

                      <div className="activity-bar">

                        <div
                          className="activity-bar-fill"
                          style={{
                            width: `${Math.min(
                              100,
                              Number(
                                item.questions
                              ) * 10
                            )}%`,
                          }}
                        ></div>

                      </div>

                      <strong>
                        {item.questions}
                      </strong>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

        </section>


        {/* RECENT QUESTIONS */}

        <section className="panel">

          <div className="panel-heading">

            <div>

              <h2>
                Recent Questions
              </h2>

              <p>
                Latest questions asked by
                this user.
              </p>

            </div>

          </div>


          {messages.filter(
            (message) =>
              String(
                message.role
              ).toLowerCase() ===
              "user"
          ).length === 0 ? (

            <div className="dashboard-empty">
              No questions found.
            </div>

          ) : (

            <div className="question-list">

              {messages
                .filter(
                  (message) =>
                    String(
                      message.role
                    ).toLowerCase() ===
                    "user"
                )
                .slice(0, 10)
                .map(
                  (message, index) => (

                    <div
                      className="question-item"
                      key={
                        message.id ||
                        index
                      }
                    >

                      <div className="question-number">
                        {index + 1}
                      </div>

                      <div className="question-content">

                        <p>
                          {message.content}
                        </p>

                        <small>
                          {message.created_at
                            ? new Date(
                                message.created_at
                              ).toLocaleString(
                                "en-IN"
                              )
                            : "-"}
                        </small>

                      </div>

                    </div>

                  )
                )}

            </div>

          )}

        </section>


        {/* RECENT MESSAGES */}

        <section className="panel">

          <div className="panel-heading">

            <div>

              <h2>
                Recent Activity
              </h2>

              <p>
                Latest messages from this
                user's conversations.
              </p>

            </div>

          </div>


          {messages.length === 0 ? (

            <div className="dashboard-empty">
              No messages found.
            </div>

          ) : (

            <div className="message-audit-list">

              {messages
                .slice(0, 12)
                .map(
                  (message, index) => (

                    <div
                      className="audit-message"
                      key={
                        message.id ||
                        index
                      }
                    >

                      <div
                        className={
                          String(
                            message.role
                          ).toLowerCase() ===
                          "user"
                            ? "audit-icon user"
                            : "audit-icon ai"
                        }
                      >
                        {String(
                          message.role
                        ).toLowerCase() ===
                        "user"
                          ? "U"
                          : "Z"}
                      </div>


                      <div className="audit-content">

                        <div className="audit-top">

                          <strong>
                            {String(
                              message.role
                            ).toLowerCase() ===
                            "user"
                              ? "User"
                              : "Zynora"}
                          </strong>

                          <small>
                            {message.created_at
                              ? new Date(
                                  message.created_at
                                ).toLocaleString(
                                  "en-IN"
                                )
                              : "-"}
                          </small>

                        </div>

                        <p>
                          {message.content}
                        </p>

                      </div>

                    </div>

                  )
                )}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}


function StatCard({
  icon,
  title,
  value,
}) {

  return (
    <div className="user-stat-card">

      <div className="stat-icon">
        {icon}
      </div>

      <div>

        <span>
          {title}
        </span>

        <strong>
          {value}
        </strong>

      </div>

    </div>
  );
}