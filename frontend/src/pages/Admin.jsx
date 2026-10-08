import React, {
  useEffect,
  useState,
} from "react";

import { api } from "../api";


export default function Admin({
  onBack,
  onUsers,
  onLogout,
}) {

  const [
    documents,
    setDocuments,
  ] = useState([]);

  const [
    metrics,
    setMetrics,
  ] = useState(null);

  const [
    logs,
    setLogs,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");


  const [
    form,
    setForm,
  ] = useState({
    title: "",
    category: "FAQ",
    content: "",
    source: "admin",
    version: "1.0",
    status: "DRAFT",
  });


  async function load() {

    try {

      setLoading(true);
      setError("");

      const [
        documentsData,
        metricsData,
        logsData,
      ] = await Promise.all([
        api.getAdminDocuments(),
        api.getMonitoringMetrics(),
        api.getSystemLogs(),
      ]);

      setDocuments(
        documentsData.documents ||
        []
      );

      setMetrics(
        metricsData.metrics ||
        null
      );

      setLogs(
        logsData.logs ||
        []
      );

    } catch (err) {

      console.error(
        "Admin dashboard error:",
        err
      );

      setError(
        err.message ||
        "Failed to load admin dashboard"
      );

    } finally {

      setLoading(false);

    }
  }


  useEffect(() => {
    load();
  }, []);


  async function addDocument(
    event
  ) {

    event.preventDefault();

    if (
      !form.title.trim() ||
      !form.content.trim()
    ) {

      setError(
        "Title and content are required."
      );

      return;
    }


    try {

      setSaving(true);
      setError("");

      await api.createKnowledgeDocument(
        form
      );


      setForm({
        title: "",
        category: "FAQ",
        content: "",
        source: "admin",
        version: "1.0",
        status: "DRAFT",
      });


      await load();

    } catch (err) {

      console.error(
        "Failed to add document:",
        err
      );

      setError(
        err.message ||
        "Failed to add document"
      );

    } finally {

      setSaving(false);

    }
  }


  async function changeStatus(
    id,
    status
  ) {

    try {

      setError("");

      await api.updateKnowledgeDocument(
        id,
        { status }
      );

      await load();

    } catch (err) {

      console.error(
        "Failed to update document:",
        err
      );

      setError(
        err.message ||
        "Failed to update document"
      );
    }
  }


  return (

    <div className="admin-page">

      <header className="admin-header">

        <div>

          <div className="admin-kicker">
            ZYNORA ADMINISTRATION
          </div>

          <h1>
            Admin Dashboard
          </h1>

          <p>
            Knowledge lifecycle,
            monitoring and user
            management.
          </p>

        </div>


        <div className="admin-header-actions">

          <button
            className="users-main-button"
            onClick={onUsers}
          >
            👥 Manage Users
          </button>


          <button
            className="secondary-button"
            onClick={onBack}
          >
            Chat
          </button>


          <button
            className="danger-button"
            onClick={onLogout}
          >
            Logout
          </button>

        </div>

      </header>


      {error && (
        <div className="error-message">
          {error}
        </div>
      )}


      {loading && (
        <div className="panel">
          Loading admin dashboard...
        </div>
      )}


      {!loading && metrics && (

        <div className="metric-grid">

          <Metric
            title="Users"
            value={
              metrics.totalUsers ?? 0
            }
          />

          <Metric
            title="Conversations"
            value={
              metrics.totalConversations ??
              0
            }
          />

          <Metric
            title="Questions"
            value={
              metrics.totalQuestions ??
              0
            }
          />

          <Metric
            title="Successful Answers"
            value={
              metrics.successfulAnswers ??
              0
            }
          />

          <Metric
            title="No Answers"
            value={
              metrics.noAnswerResponses ??
              0
            }
          />

          <Metric
            title="Avg Response"
            value={`${metrics.averageResponseTimeMs ?? 0} ms`}
          />

        </div>

      )}


      {/* USER MANAGEMENT SHORTCUT */}

      <section className="admin-feature-card">

        <div className="feature-icon">
          👥
        </div>

        <div className="feature-content">

          <h2>
            User Management
          </h2>

          <p>
            View all registered users,
            inspect their conversations,
            questions and individual
            usage analytics.
          </p>

        </div>

        <button
          className="view-feature-button"
          onClick={onUsers}
        >
          View Users →
        </button>

      </section>


      <section className="admin-grid">

        <form
          className="panel"
          onSubmit={addDocument}
        >

          <h2>
            Add Knowledge
          </h2>

          <input
            placeholder="Title"
            value={form.title}
            onChange={(event) =>
              setForm({
                ...form,
                title:
                  event.target.value,
              })
            }
          />


          <input
            placeholder="Category"
            value={form.category}
            onChange={(event) =>
              setForm({
                ...form,
                category:
                  event.target.value,
              })
            }
          />


          <input
            placeholder="Source"
            value={form.source}
            onChange={(event) =>
              setForm({
                ...form,
                source:
                  event.target.value,
              })
            }
          />


          <input
            placeholder="Version"
            value={form.version}
            onChange={(event) =>
              setForm({
                ...form,
                version:
                  event.target.value,
              })
            }
          />


          <textarea
            placeholder="Approved Zyngram content"
            value={form.content}
            onChange={(event) =>
              setForm({
                ...form,
                content:
                  event.target.value,
              })
            }
          />


          <button
            type="submit"
            disabled={saving}
          >
            {saving
              ? "Adding..."
              : "Add Document"}
          </button>

        </form>


        <section className="panel">

          <h2>
            Knowledge Documents
          </h2>


          {documents.length === 0 ? (

            <p>
              No knowledge documents
              found.
            </p>

          ) : (

            documents.map(
              (document) => (

                <div
                  className="doc-row"
                  key={document.id}
                >

                  <div>

                    <strong>
                      {document.title}
                    </strong>

                    <small>
                      {document.category}
                      {" · "}
                      v{document.version}
                      {" · "}
                      {document.status}
                    </small>

                  </div>


                  <div>

                    {document.status !==
                      "APPROVED" && (

                      <button
                        onClick={() =>
                          changeStatus(
                            document.id,
                            "APPROVED"
                          )
                        }
                      >
                        Approve
                      </button>

                    )}


                    {document.status !==
                      "ARCHIVED" && (

                      <button
                        onClick={() =>
                          changeStatus(
                            document.id,
                            "ARCHIVED"
                          )
                        }
                      >
                        Archive
                      </button>

                    )}

                  </div>

                </div>

              )
            )

          )}

        </section>

      </section>


      <section className="panel">

        <h2>
          Production Logs
        </h2>

        <div className="logs">

          {logs.length === 0 ? (

            <p>
              No production logs found.
            </p>

          ) : (

            logs.map(
              (log) => (

                <div
                  className="log-row"
                  key={log.id}
                >

                  <code>
                    {log.trace_id || "-"}
                  </code>

                  <span>
                    {log.created_at
                      ? new Date(
                          log.created_at
                        ).toLocaleString()
                      : "-"}
                  </span>

                  <span>
                    {log.action || "-"}
                  </span>

                  <span>
                    {log.module || "-"}
                  </span>

                  <strong>
                    {log.status || "-"}
                  </strong>

                </div>

              )
            )

          )}

        </div>

      </section>

    </div>
  );
}


function Metric({
  title,
  value,
}) {

  return (

    <div className="metric">

      <small>
        {title}
      </small>

      <strong>
        {value}
      </strong>

    </div>
  );
}