const { pool } = require('../config/db');

class Folder {
  static async findByUserId(userId) {
    const [rows] = await pool.query(
      `SELECT f.*, COUNT(p.id) AS credential_count
       FROM folders f
       LEFT JOIN passwords p ON f.id = p.folder_id
       WHERE f.user_id = ?
       GROUP BY f.id
       ORDER BY f.folder_name ASC`,
      [userId]
    );
    return rows;
  }

  static async findById(id, userId) {
    const [rows] = await pool.query('SELECT * FROM folders WHERE id = ? AND user_id = ?', [id, userId]);
    return rows[0] || null;
  }

  static async create({ user_id, folder_name, description }) {
    const [result] = await pool.query(
      'INSERT INTO folders (user_id, folder_name, description) VALUES (?, ?, ?)',
      [user_id, folder_name, description || null]
    );
    return result.insertId;
  }

  static async update(id, userId, { folder_name, description }) {
    await pool.query(
      'UPDATE folders SET folder_name = ?, description = ? WHERE id = ? AND user_id = ?',
      [folder_name, description || null, id, userId]
    );
    return this.findById(id, userId);
  }

  static async delete(id, userId) {
    const [result] = await pool.query('DELETE FROM folders WHERE id = ? AND user_id = ?', [id, userId]);
    return result.affectedRows > 0;
  }
}

module.exports = Folder;
