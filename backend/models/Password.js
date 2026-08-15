const { pool } = require('../config/db');

class Password {
  static async findAllByUser(userId, { category, folder_id, favorite, search } = {}) {
    let sql = `
      SELECT p.id, p.user_id, p.folder_id, p.service_name, p.username, 
             p.website_url, p.category, p.notes, p.favorite, p.created_at, p.updated_at,
             f.folder_name, p.iv, p.auth_tag, p.encrypted_password
      FROM passwords p
      LEFT JOIN folders f ON p.folder_id = f.id
      WHERE p.user_id = ?
    `;
    const params = [userId];

    if (category && category !== 'All') {
      sql += ' AND p.category = ?';
      params.push(category);
    }

    if (folder_id) {
      sql += ' AND p.folder_id = ?';
      params.push(folder_id);
    }

    if (favorite === 'true' || favorite === '1' || favorite === true) {
      sql += ' AND p.favorite = 1';
    }

    if (search && search.trim() !== '') {
      sql += ' AND (p.service_name LIKE ? OR p.username LIKE ? OR p.category LIKE ? OR f.folder_name LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    sql += ' ORDER BY p.updated_at DESC';

    const [rows] = await pool.query(sql, params);
    return rows;
  }

  static async findById(id, userId) {
    const [rows] = await pool.query(
      `SELECT p.*, f.folder_name 
       FROM passwords p 
       LEFT JOIN folders f ON p.folder_id = f.id 
       WHERE p.id = ? AND p.user_id = ?`,
      [id, userId]
    );
    return rows[0] || null;
  }

  static async create({
    user_id,
    folder_id,
    service_name,
    username,
    encrypted_password,
    iv,
    auth_tag,
    website_url,
    category = 'Work',
    notes,
    favorite = 0
  }) {
    const [result] = await pool.query(
      `INSERT INTO passwords 
       (user_id, folder_id, service_name, username, encrypted_password, iv, auth_tag, website_url, category, notes, favorite)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        folder_id || null,
        service_name,
        username,
        encrypted_password,
        iv,
        auth_tag,
        website_url || null,
        category,
        notes || null,
        favorite ? 1 : 0
      ]
    );
    return result.insertId;
  }

  static async update(id, userId, {
    folder_id,
    service_name,
    username,
    encrypted_password,
    iv,
    auth_tag,
    website_url,
    category,
    notes,
    favorite
  }) {
    let sql = `
      UPDATE passwords SET 
        folder_id = ?,
        service_name = ?,
        username = ?,
        website_url = ?,
        category = ?,
        notes = ?,
        favorite = ?
    `;
    const params = [
      folder_id || null,
      service_name,
      username,
      website_url || null,
      category,
      notes || null,
      favorite ? 1 : 0
    ];

    if (encrypted_password && iv && auth_tag) {
      sql += `, encrypted_password = ?, iv = ?, auth_tag = ?`;
      params.push(encrypted_password, iv, auth_tag);
    }

    sql += ` WHERE id = ? AND user_id = ?`;
    params.push(id, userId);

    await pool.query(sql, params);
    return this.findById(id, userId);
  }

  static async toggleFavorite(id, userId) {
    await pool.query(
      'UPDATE passwords SET favorite = NOT favorite WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    const pwd = await this.findById(id, userId);
    return pwd ? pwd.favorite : 0;
  }

  static async delete(id, userId) {
    const [result] = await pool.query('DELETE FROM passwords WHERE id = ? AND user_id = ?', [id, userId]);
    return result.affectedRows > 0;
  }

  static async getStatsByUser(userId) {
    const [counts] = await pool.query(
      `SELECT 
        COUNT(*) AS total_credentials,
        SUM(CASE WHEN favorite = 1 THEN 1 ELSE 0 END) AS total_favorites
       FROM passwords WHERE user_id = ?`,
      [userId]
    );
    return counts[0] || { total_credentials: 0, total_favorites: 0 };
  }
}

module.exports = Password;
