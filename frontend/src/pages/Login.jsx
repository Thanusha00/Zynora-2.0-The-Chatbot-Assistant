import React, { useState } from "react";
import { api } from "../api";

export default function Login({ onLogin }) {
  const [mode, setMode] = useState("user");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [name, setName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function switchMode(newMode) {
    setMode(newMode);
    setError("");
    setSuccess("");
  }

  async function handleUserLogin(event) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const result = await api.login(email, password);

      if (!result.success) {
        throw new Error(
          result.message || "Invalid email or password."
        );
      }

      if (result.user?.role?.toUpperCase() === "ADMIN") {
        throw new Error(
          "Please use Admin Login for administrator access."
        );
      }

      localStorage.setItem("zynora_token", result.token);
      localStorage.setItem(
        "zynora_user",
        JSON.stringify(result.user)
      );

      onLogin(result.user);
    } catch (error) {
      setError(error.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdminLogin(event) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const result = await api.login(email, password);

      if (!result.success) {
        throw new Error("Invalid admin credentials.");
      }

      if (
        result.user?.role?.toUpperCase() !== "ADMIN"
      ) {
        throw new Error(
          "This account does not have administrator access."
        );
      }

      localStorage.setItem("zynora_token", result.token);
      localStorage.setItem(
        "zynora_user",
        JSON.stringify(result.user)
      );

      onLogin(result.user);
    } catch (error) {
      setError(
        error.message || "Invalid administrator credentials."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (registerPassword.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    setLoading(true);

    try {
      const result = await api.register(
        registerEmail,
        registerPassword,
        name
      );

      if (!result.success) {
        throw new Error(
          result.message || "Registration failed."
        );
      }

      setSuccess(
        "Account created successfully. You can now sign in."
      );

      setEmail(registerEmail);
      setPassword("");
      setName("");
      setRegisterEmail("");
      setRegisterPassword("");

      setTimeout(() => {
        setMode("user");
      }, 1000);
    } catch (error) {
      setError(
        error.message || "Registration failed."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">

      {/* Background decoration */}
      <div className="auth-glow auth-glow-one"></div>
      <div className="auth-glow auth-glow-two"></div>

      <div className="auth-container">

        {/* LEFT BRAND PANEL */}

        <section className="auth-brand">

          <div className="brand-logo">
            <div className="brand-icon">
              Z
            </div>

            <div>
              <h1>Zynora</h1>
              <span>ZYngram Intelligence</span>
            </div>
          </div>

          <div className="brand-content">

            <div className="eyebrow">
              INTERNAL AI ASSISTANT
            </div>

            <h2>
              Your trusted gateway to
              <span> Zyngram knowledge.</span>
            </h2>

            <p>
              Search approved company knowledge,
              franchise information, policies and
              operational guidance through a secure
              RAG-powered assistant.
            </p>

            <div className="feature-list">

              <div className="feature">
                <div className="feature-icon">✓</div>
                <div>
                  <strong>Approved Knowledge</strong>
                  <span>
                    Answers grounded in Zyngram's
                    approved knowledge base.
                  </span>
                </div>
              </div>

              <div className="feature">
                <div className="feature-icon">◆</div>
                <div>
                  <strong>Secure by Design</strong>
                  <span>
                    Role-based access and protected
                    enterprise conversations.
                  </span>
                </div>
              </div>

              <div className="feature">
                <div className="feature-icon">◈</div>
                <div>
                  <strong>Traceable Answers</strong>
                  <span>
                    View sources and confidence behind
                    every grounded response.
                  </span>
                </div>
              </div>

            </div>

          </div>

          <div className="brand-footer">
            <span>ZYngram Internal Platform</span>
            <span>•</span>
            <span>Zynora v2.0</span>
          </div>

        </section>


        {/* RIGHT AUTH PANEL */}

        <section className="auth-panel">

          <div className="auth-card">

            {/* Mobile logo */}
            <div className="mobile-logo">
              <div className="brand-icon">Z</div>
              <strong>Zynora</strong>
            </div>

            <div className="auth-heading">

              {mode === "user" && (
                <>
                  <span className="auth-kicker">
                    WELCOME BACK
                  </span>

                  <h2>Sign in to Zynora</h2>

                  <p>
                    Access your Zyngram knowledge
                    workspace.
                  </p>
                </>
              )}

              {mode === "register" && (
                <>
                  <span className="auth-kicker">
                    GET STARTED
                  </span>

                  <h2>Create your account</h2>

                  <p>
                    Register to access the Zynora
                    knowledge assistant.
                  </p>
                </>
              )}

              {mode === "admin" && (
                <>
                  <span className="auth-kicker">
                    RESTRICTED ACCESS
                  </span>

                  <h2>Administrator sign in</h2>

                  <p>
                    Authorized administrators only.
                  </p>
                </>
              )}

            </div>


            {/* AUTH NAVIGATION */}

            <div className="auth-switch">

              <button
                type="button"
                className={
                  mode === "user" ? "selected" : ""
                }
                onClick={() => switchMode("user")}
              >
                User Login
              </button>

              <button
                type="button"
                className={
                  mode === "register" ? "selected" : ""
                }
                onClick={() => switchMode("register")}
              >
                Register
              </button>

              <button
                type="button"
                className={
                  mode === "admin" ? "selected" : ""
                }
                onClick={() => switchMode("admin")}
              >
                Admin
              </button>

            </div>


            {/* MESSAGES */}

            {error && (
              <div className="auth-alert error">
                <span>!</span>
                {error}
              </div>
            )}

            {success && (
              <div className="auth-alert success">
                <span>✓</span>
                {success}
              </div>
            )}


            {/* USER LOGIN */}

            {mode === "user" && (

              <form
                className="auth-form"
                onSubmit={handleUserLogin}
              >

                <div className="field">

                  <label>Email address</label>

                  <div className="input-wrapper">

                    <span className="input-icon">
                      @
                    </span>

                    <input
                      type="email"
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                      placeholder="you@example.com"
                      required
                    />

                  </div>

                </div>


                <div className="field">

                  <div className="field-label-row">

                    <label>Password</label>

                  </div>

                  <div className="input-wrapper">

                    <span className="input-icon">
                      •
                    </span>

                    <input
                      type="password"
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      placeholder="Enter your password"
                      required
                    />

                  </div>

                </div>


                <button
                  className="primary-button"
                  type="submit"
                  disabled={loading}
                >
                  {loading
                    ? "Signing you in..."
                    : "Sign in"}
                </button>

              </form>
            )}


            {/* REGISTER */}

            {mode === "register" && (

              <form
                className="auth-form"
                onSubmit={handleRegister}
              >

                <div className="field">

                  <label>Full name</label>

                  <div className="input-wrapper">

                    <span className="input-icon">
                      ◯
                    </span>

                    <input
                      type="text"
                      value={name}
                      onChange={(e) =>
                        setName(e.target.value)
                      }
                      placeholder="Your full name"
                      required
                    />

                  </div>

                </div>


                <div className="field">

                  <label>Email address</label>

                  <div className="input-wrapper">

                    <span className="input-icon">
                      @
                    </span>

                    <input
                      type="email"
                      value={registerEmail}
                      onChange={(e) =>
                        setRegisterEmail(
                          e.target.value
                        )
                      }
                      placeholder="you@example.com"
                      required
                    />

                  </div>

                </div>


                <div className="field">

                  <label>Create password</label>

                  <div className="input-wrapper">

                    <span className="input-icon">
                      •
                    </span>

                    <input
                      type="password"
                      value={registerPassword}
                      onChange={(e) =>
                        setRegisterPassword(
                          e.target.value
                        )
                      }
                      placeholder="Minimum 6 characters"
                      required
                    />

                  </div>

                </div>


                <button
                  className="primary-button"
                  type="submit"
                  disabled={loading}
                >
                  {loading
                    ? "Creating account..."
                    : "Create account"}
                </button>

              </form>
            )}


            {/* ADMIN */}

            {mode === "admin" && (

              <form
                className="auth-form"
                onSubmit={handleAdminLogin}
              >

                <div className="admin-notice">
                  <div className="admin-notice-icon">
                    !
                  </div>

                  <div>
                    <strong>
                      Administrator access
                    </strong>

                    <span>
                      This area is restricted to
                      authorized Zyngram administrators.
                    </span>
                  </div>
                </div>


                <div className="field">

                  <label>Administrator email</label>

                  <div className="input-wrapper">

                    <span className="input-icon">
                      @
                    </span>

                    <input
                      type="email"
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                      placeholder="Administrator email"
                      required
                    />

                  </div>

                </div>


                <div className="field">

                  <label>Administrator password</label>

                  <div className="input-wrapper">

                    <span className="input-icon">
                      •
                    </span>

                    <input
                      type="password"
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      placeholder="Enter administrator password"
                      required
                    />

                  </div>

                </div>


                <button
                  className="primary-button admin-button"
                  type="submit"
                  disabled={loading}
                >
                  {loading
                    ? "Verifying..."
                    : "Administrator sign in"}
                </button>

              </form>
            )}


            <div className="auth-security">

              <span className="security-dot"></span>

              <span>
                Secure connection •
                Zyngram approved knowledge only
              </span>

            </div>

          </div>

        </section>

      </div>

    </div>
  );
}