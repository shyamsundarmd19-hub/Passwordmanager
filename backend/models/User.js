const { pool } = require('../config/db');

class User {
  static async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT id, full_name, email, role, created_at, updated_at FROM users WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async create({ full_name, email, password_hash, role = 'USER' }) {
    const [result] = await pool.query(
      'INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [full_name, email, password_hash, role]
    );
    return result.insertId;
  }

  static async updateProfile(id, { full_name, email }) {
    await pool.query(
      'UPDATE users SET full_name = ?, email = ? WHERE id = ?',
      [full_name, email, id]
    );
    return this.findById(id);
  }

  static async updatePassword(id, newPasswordHash) {
    await pool.query(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [newPasswordHash, id]
    );
  }
}

module.exports = User;
