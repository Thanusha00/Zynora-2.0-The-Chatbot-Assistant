const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );
}

async function login(req, res) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const result = await pool.query(
      "SELECT id,name,email,password_hash,role FROM users WHERE LOWER(email)=LOWER($1)",
      [String(email).trim()]
    );

    if (!result.rows.length) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const user = result.rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);

    if (!ok) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role };
    res.json({ success: true, token: signToken(safeUser), user: safeUser });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

async function register(req, res) {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password || password.length < 6) {
      return res.status(400).json({ success: false, message: "Name, valid email and password (6+ chars) are required" });
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name,email,password_hash,role)
       VALUES ($1,$2,$3,'USER')
       RETURNING id,name,email,role`,
      [String(name).trim(), String(email).trim().toLowerCase(), hash]
    );

    res.status(201).json({ success: true, user: result.rows[0] });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

module.exports = { login, register };
