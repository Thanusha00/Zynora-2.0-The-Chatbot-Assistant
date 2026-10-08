import React, {
  useEffect,
  useState,
} from "react";

import { api } from "../api";


export default function Users({
  onBack,
  onUserSelect,
  onLogout,
}) {
  const [
    users,
    setUsers,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");


  async function loadUsers() {
    try {
      setLoading(true);
      setError("");

      const data =
        await api.getUsers();

      setUsers(
        data.users || []
      );
    } catch (err) {
      console.error(
        "Users error:",
        err
      );

      setError(
        err.message ||
        "Failed to load users"
      );
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadUsers();
  }, []);


  return (
    <div className="admin-page">

      <header className="admin-header">

        <div>
          <div className="admin-kicker">
            ZYNORA ADMINISTRATION
          </div>

          <h1>
            User Management
          </h1>

          <p>
            View registered users and
            their Zynora activity.
          </p>
        </div>


        <div className="admin-header-actions">

          <button
            className="secondary-button"
            onClick={onBack}
          >
            ← Dashboard
          </button>

          <button
            className="danger-button"
            onClick={onLogout}
          >
            Logout
          </button>

        </div>

      </header>


      <main className="users-container">

        <section className="users-summary">

          <div>
            <span>
              Registered Users
            </span>

            <strong>
              {users.length}
            </strong>
          </div>

          <div>
            <span>
              Account Type
            </span>

            <strong>
              Normal Users
            </strong>
          </div>

          <div>
            <span>
              Access
            </span>

            <strong>
              Protected
            </strong>
          </div>

        </section>


        {error && (
          <div className="error-message">
            {error}
          </div>
        )}


        <section className="panel users-panel">

          <div className="panel-heading">

            <div>
              <h2>
                All Users
              </h2>

              <p>
                Select a user to view
                their individual dashboard.
              </p>
            </div>

            <button
              className="refresh-button"
              onClick={loadUsers}
            >
              ↻ Refresh
            </button>

          </div>


          {loading ? (
            <div className="users-loading">
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="users-empty">

              <div className="empty-icon">
                👥
              </div>

              <h3>
                No users found
              </h3>

              <p>
                Registered users will
                appear here.
              </p>

            </div>
          ) : (

            <div className="users-table-wrapper">

              <table className="users-table">

                <thead>

                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Registered</th>
                    <th>Role</th>
                    <th>Action</th>
                  </tr>

                </thead>


                <tbody>

                  {users.map(
                    (user) => (

                      <tr
                        key={user.id}
                      >

                        <td>

                          <div className="user-cell">

                            <div className="user-avatar">
                              {(
                                user.name ||
                                user.email ||
                                "U"
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>

                              <strong>
                                {user.name ||
                                  "Unnamed User"}
                              </strong>

                              <small>
                                ID: {user.id}
                              </small>

                            </div>

                          </div>

                        </td>


                        <td>
                          {user.email}
                        </td>


                        <td>
                          {user.created_at
                            ? new Date(
                                user.created_at
                              ).toLocaleDateString(
                                "en-IN"
                              )
                            : "-"}
                        </td>


                        <td>

                          <span className="role-badge">
                            {user.role ||
                              "USER"}
                          </span>

                        </td>


                        <td>

                          <button
                            className="view-user-button"
                            onClick={() =>
                              onUserSelect(
                                user
                              )
                            }
                          >
                            View Dashboard →
                          </button>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </main>

    </div>
  );
}